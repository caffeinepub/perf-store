const CACHE_NAME = 'perf-store-v1';

// Service Worker Metadata
const SW_META = {
  company: 'LEMA',
  serviceProvider: 'Adrian Were',
  phone: '0706130805',
  buildDate: '2026-03-08',
  buildYear: '2026',
  buildTime: '20:33:41 UTC',
  buildTimestamp: '2026-03-08T20:33:41.734Z'
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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Network-first for API/backend calls
  if (event.request.url.includes('/api/') || event.request.url.includes('icp')) {
    return;
  }

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
