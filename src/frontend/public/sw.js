const CACHE_NAME = 'perf-store-v2';
const BG_SYNC_CACHE = 'perf-bg-sync-queue';

// ── Service Worker Metadata ───────────────────────────────────────────────────
const SW_META = {
  company: 'LEMA',
  serviceProvider: 'Adrian Were',
  phone: '0706130805',
  buildDate: '2026-03-09',
  buildYear: '2026',
  buildTime: '00:00:00 UTC',
  buildTimestamp: '2026-03-09T00:00:00.000Z'
};

console.log(
  `[Perf Store SW] Company: ${SW_META.company} | ` +
  `Service Provider: ${SW_META.serviceProvider} (${SW_META.phone}) | ` +
  `Build: ${SW_META.buildTimestamp}`
);

const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// ── Install ───────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ── Activate ──────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== BG_SYNC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// ── Fetch (network-first with offline fallback + background sync queuing) ─────

self.addEventListener('fetch', (event) => {
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Skip API/ICP calls for GET; queue POST/PUT/PATCH for background sync
  const isApi = event.request.url.includes('/api/') || event.request.url.includes('icp');

  if (event.request.method !== 'GET') {
    // Queue non-GET API mutations for background sync on failure
    if (isApi) {
      event.waitUntil(queueRequestForSync(event.request.clone()));
    }
    return;
  }

  if (isApi) return;

  // Network-first strategy for GET requests
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('/index.html');
        });
      })
  );
});

// ── Background Sync (resilience for poor connections) ─────────────────────────

async function queueRequestForSync(request) {
  try {
    const cache = await caches.open(BG_SYNC_CACHE);
    // Use timestamp-keyed URL to avoid collisions
    const keyUrl = `${request.url}?_swqueue=${Date.now()}`;
    const cloned = new Request(keyUrl, {
      method: request.method,
      headers: request.headers,
      body: await request.text(),
    });
    await cache.put(cloned, new Response('queued'));
    // Register a sync tag
    if ('sync' in self.registration) {
      await self.registration.sync.register('perf-bg-sync');
    }
  } catch (err) {
    console.warn('[Perf Store SW] Could not queue request:', err);
  }
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'perf-bg-sync') {
    event.waitUntil(replayQueuedRequests());
  }
});

async function replayQueuedRequests() {
  try {
    const cache = await caches.open(BG_SYNC_CACHE);
    const keys = await cache.keys();
    for (const request of keys) {
      try {
        await fetch(request);
        await cache.delete(request);
        console.log('[Perf Store SW] Replayed queued request:', request.url);
      } catch {
        // Still offline — leave in queue for next sync attempt
        console.warn('[Perf Store SW] Still offline, keeping queued request:', request.url);
      }
    }
  } catch (err) {
    console.warn('[Perf Store SW] replayQueuedRequests error:', err);
  }
}

// ── Periodic Background Sync (instant data refresh) ───────────────────────────

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'perf-periodic-sync') {
    event.waitUntil(refreshAppData());
  }
});

async function refreshAppData() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch('/');
    if (response.ok) {
      await cache.put('/', response);
      console.log('[Perf Store SW] App shell refreshed via periodic sync');
    }
  } catch {
    console.warn('[Perf Store SW] Periodic sync fetch failed (offline)');
  }
}

// ── Push Notifications ────────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data?.json() || {};
  } catch {
    data = { body: event.data?.text() };
  }

  const title = data.title || 'Perf Store';
  const options = {
    body: data.body || 'You have a new notification from Perf Store.',
    icon: '/assets/generated/pwa-icon-192.dim_192x192.png',
    badge: '/assets/generated/pwa-icon-192.dim_192x192.png',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// ── Message Handler (register sync/periodic sync from app) ────────────────────

self.addEventListener('message', (event) => {
  const { type } = event.data || {};

  if (type === 'REGISTER_PERIODIC_SYNC') {
    if ('periodicSync' in self.registration) {
      self.registration.periodicSync
        .register('perf-periodic-sync', { minInterval: 12 * 60 * 60 * 1000 })
        .then(() => console.log('[Perf Store SW] Periodic sync registered'))
        .catch((err) => console.warn('[Perf Store SW] Periodic sync failed:', err));
    }
  }

  if (type === 'REGISTER_BG_SYNC') {
    if ('sync' in self.registration) {
      self.registration.sync
        .register('perf-bg-sync')
        .then(() => console.log('[Perf Store SW] Background sync registered'))
        .catch((err) => console.warn('[Perf Store SW] BG sync register failed:', err));
    }
  }

  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
