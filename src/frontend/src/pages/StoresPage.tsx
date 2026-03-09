import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  Package,
  Phone,
  Save,
  Search,
  Store,
  StoreIcon,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { PartnerProduct } from "../backend.d";
import { useActor } from "../hooks/useActor";

// ── Types ────────────────────────────────────────────────────────────────────

interface PartnerStore {
  id: string;
  ownerEmail: string;
  storeName: string;
  description: string;
  location: string;
  phone: string;
  website: string;
  createdAt: number;
}

interface StoresPageProps {
  userEmail: string;
}

// ── localStorage helpers ─────────────────────────────────────────────────────

const STORES_KEY = "perf_partner_stores";

function loadStores(): PartnerStore[] {
  try {
    const raw = localStorage.getItem(STORES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PartnerStore[];
  } catch {
    return [];
  }
}

function saveStores(stores: PartnerStore[]) {
  localStorage.setItem(STORES_KEY, JSON.stringify(stores));
}

// ── Sub-components ───────────────────────────────────────────────────────────

interface StoreDetailProps {
  store: PartnerStore;
  onBack: () => void;
}

function StoreDetail({ store, onBack }: StoreDetailProps) {
  const { actor, isFetching } = useActor();

  const { data: allProducts, isLoading: productsLoading } = useQuery<
    PartnerProduct[]
  >({
    queryKey: ["allPartnerProducts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPartnerProducts();
    },
    enabled: !!actor && !isFetching,
  });

  const storeProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts.filter((p) => p.status === "approved");
  }, [allProducts]);

  return (
    <motion.div
      key="store-detail"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25 }}
      className="min-h-full"
      data-ocid="stores.detail.panel"
    >
      {/* Back button */}
      <div className="px-4 pt-4 pb-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-gold transition-colors text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
          data-ocid="stores.detail.button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stores
        </button>
      </div>

      {/* Store header */}
      <div className="px-4 pb-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
            <StoreIcon className="w-6 h-6 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-bold text-foreground leading-tight">
              {store.storeName}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground text-xs font-body">
                {store.location}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm font-body text-muted-foreground leading-relaxed mb-4">
          {store.description}
        </p>

        {/* Contact row */}
        <div className="flex flex-wrap gap-2">
          {store.phone && (
            <a
              href={`tel:${store.phone}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border border-border hover:border-gold/40 transition-colors text-xs font-body text-foreground"
              data-ocid="stores.detail.link"
            >
              <Phone className="w-3.5 h-3.5 text-gold" />
              {store.phone}
            </a>
          )}
          {store.website && (
            <a
              href={
                store.website.startsWith("http")
                  ? store.website
                  : `https://${store.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border border-border hover:border-gold/40 transition-colors text-xs font-body text-foreground"
              data-ocid="stores.detail.link"
            >
              <Globe className="w-3.5 h-3.5 text-gold" />
              Website
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </a>
          )}
        </div>
      </div>

      {/* Products by this store */}
      <div className="px-4 pb-8">
        <h3 className="font-display text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Package className="w-4 h-4 text-gold" />
          Products by this Store
        </h3>

        {productsLoading && (
          <div
            className="grid grid-cols-2 gap-3"
            data-ocid="stores.products.loading_state"
          >
            {["p1", "p2", "p3", "p4"].map((k) => (
              <div
                key={k}
                className="bg-card border border-border rounded-lg overflow-hidden"
              >
                <Skeleton className="w-full aspect-[3/4] bg-muted" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-3.5 w-3/4 bg-muted" />
                  <Skeleton className="h-3 w-1/2 bg-muted" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!productsLoading && storeProducts.length === 0 && (
          <div
            className="text-center py-12 bg-card border border-border rounded-lg"
            data-ocid="stores.products.empty_state"
          >
            <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm font-body">
              No approved products yet
            </p>
          </div>
        )}

        {!productsLoading && storeProducts.length > 0 && (
          <div
            className="grid grid-cols-2 gap-3"
            data-ocid="stores.products.list"
          >
            {storeProducts.map((product, i) => (
              <motion.div
                key={String(product.id)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-card border border-border rounded-lg overflow-hidden hover:border-gold/30 transition-colors"
                data-ocid={`stores.products.item.${i + 1}`}
              >
                <div className="aspect-[3/4] bg-muted overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-display text-xs font-semibold text-foreground truncate mb-0.5">
                    {product.name}
                  </p>
                  <p className="text-gold text-xs font-body font-semibold">
                    ${Number(product.price)}
                  </p>
                  {product.category && (
                    <Badge
                      variant="outline"
                      className="mt-1.5 text-[10px] px-1.5 py-0 border-gold/30 text-muted-foreground"
                    >
                      {product.category}
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Store Card ───────────────────────────────────────────────────────────────

interface StoreCardProps {
  store: PartnerStore;
  index: number;
  onView: () => void;
}

function StoreCard({ store, index, onView }: StoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="group bg-card border border-border rounded-lg p-4 hover:border-gold/40 hover:shadow-gold transition-all duration-300 cursor-pointer"
      onClick={onView}
      data-ocid={`stores.item.${index + 1}`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
          <StoreIcon className="w-5 h-5 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-sm font-semibold text-foreground truncate group-hover:text-gold transition-colors">
            {store.storeName}
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-muted-foreground/70 shrink-0" />
            <span className="text-muted-foreground text-[11px] font-body truncate">
              {store.location}
            </span>
          </div>
        </div>
      </div>
      <p className="text-muted-foreground text-xs font-body line-clamp-2 leading-relaxed mb-3">
        {store.description}
      </p>
      <div className="flex items-center justify-between">
        {store.phone && (
          <span className="flex items-center gap-1 text-[11px] font-body text-muted-foreground">
            <Phone className="w-3 h-3" />
            {store.phone}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="ml-auto text-[11px] font-body text-gold hover:text-gold/80 transition-colors underline underline-offset-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold rounded"
          data-ocid={`stores.view.button.${index + 1}`}
        >
          View Store →
        </button>
      </div>
    </motion.div>
  );
}

// ── My Store Form ────────────────────────────────────────────────────────────

interface MyStoreFormProps {
  userEmail: string;
  existingStore: PartnerStore | null;
  onSaved: (store: PartnerStore) => void;
}

function MyStoreForm({ userEmail, existingStore, onSaved }: MyStoreFormProps) {
  const [storeName, setStoreName] = useState(existingStore?.storeName ?? "");
  const [description, setDescription] = useState(
    existingStore?.description ?? "",
  );
  const [location, setLocation] = useState(existingStore?.location ?? "");
  const [phone, setPhone] = useState(existingStore?.phone ?? "");
  const [website, setWebsite] = useState(existingStore?.website ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      toast.error("Store name is required");
      return;
    }
    if (!location.trim()) {
      toast.error("Location is required");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const stores = loadStores();
      const now = Date.now();

      let updatedStore: PartnerStore;
      if (existingStore) {
        updatedStore = {
          ...existingStore,
          storeName: storeName.trim(),
          description: description.trim(),
          location: location.trim(),
          phone: phone.trim(),
          website: website.trim(),
        };
        const idx = stores.findIndex((s) => s.ownerEmail === userEmail);
        if (idx >= 0) stores[idx] = updatedStore;
        else stores.push(updatedStore);
      } else {
        updatedStore = {
          id: crypto.randomUUID(),
          ownerEmail: userEmail,
          storeName: storeName.trim(),
          description: description.trim(),
          location: location.trim(),
          phone: phone.trim(),
          website: website.trim(),
          createdAt: now,
        };
        stores.push(updatedStore);
      }

      saveStores(stores);
      setIsSaving(false);
      toast.success(
        existingStore ? "Store updated!" : "Store registered successfully!",
      );
      onSaved(updatedStore);
    }, 400);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      data-ocid="stores.my_store.panel"
    >
      <div className="space-y-1.5">
        <Label
          htmlFor="storeName"
          className="text-xs font-body text-muted-foreground uppercase tracking-wider"
        >
          Store Name *
        </Label>
        <Input
          id="storeName"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="My Fragrance Boutique"
          required
          className="bg-secondary border-border focus:border-gold/60 font-body text-sm"
          data-ocid="stores.my_store.input"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="location"
          className="text-xs font-body text-muted-foreground uppercase tracking-wider"
        >
          Location *
        </Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Nairobi, Kenya"
          required
          className="bg-secondary border-border focus:border-gold/60 font-body text-sm"
          data-ocid="stores.my_store.input"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="description"
          className="text-xs font-body text-muted-foreground uppercase tracking-wider"
        >
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell shoppers about your store, what you sell, your specialty…"
          rows={4}
          className="bg-secondary border-border focus:border-gold/60 font-body text-sm resize-none"
          data-ocid="stores.my_store.textarea"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="phone"
            className="text-xs font-body text-muted-foreground uppercase tracking-wider"
          >
            Phone
          </Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0712 345 678"
            className="bg-secondary border-border focus:border-gold/60 font-body text-sm"
            data-ocid="stores.my_store.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="website"
            className="text-xs font-body text-muted-foreground uppercase tracking-wider"
          >
            Website
          </Label>
          <Input
            id="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="mystore.com"
            className="bg-secondary border-border focus:border-gold/60 font-body text-sm"
            data-ocid="stores.my_store.input"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSaving}
        className="w-full bg-gold text-primary-foreground hover:bg-gold-dim font-body font-semibold tracking-wider h-11"
        data-ocid="stores.my_store.submit_button"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            {existingStore ? "Update Store" : "Register Store"}
          </>
        )}
      </Button>
    </form>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export function StoresPage({ userEmail }: StoresPageProps) {
  const [stores, setStores] = useState<PartnerStore[]>(() => loadStores());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState<PartnerStore | null>(null);
  const [myStoreSaved, setMyStoreSaved] = useState(false);

  const myStore = useMemo(
    () => stores.find((s) => s.ownerEmail === userEmail) ?? null,
    [stores, userEmail],
  );

  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) return stores;
    const q = searchQuery.toLowerCase();
    return stores.filter(
      (s) =>
        s.storeName.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q),
    );
  }, [stores, searchQuery]);

  const handleStoreSaved = (_store: PartnerStore) => {
    setStores(loadStores());
    setMyStoreSaved(true);
  };

  // Show store detail
  if (selectedStore) {
    return (
      <div className="min-h-full bg-background">
        <AnimatePresence mode="wait">
          <StoreDetail
            store={selectedStore}
            onBack={() => setSelectedStore(null)}
          />
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background" data-ocid="stores.page">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center gap-2">
            <Store className="text-gold w-5 h-5" />
            <h1 className="font-display text-xl font-bold text-foreground">
              Partner Stores
            </h1>
          </div>
          <p className="text-muted-foreground text-xs font-body mt-0.5 tracking-widest uppercase">
            Browse & Manage Stores
          </p>
        </div>
      </header>

      <main className="px-4 py-5">
        <Tabs defaultValue="browse" className="w-full">
          <TabsList
            className="w-full bg-secondary border border-border mb-5"
            data-ocid="stores.tab"
          >
            <TabsTrigger
              value="browse"
              className="flex-1 font-body text-xs data-[state=active]:bg-gold/10 data-[state=active]:text-gold"
              data-ocid="stores.browse.tab"
            >
              Browse Stores
            </TabsTrigger>
            <TabsTrigger
              value="mystore"
              className="flex-1 font-body text-xs data-[state=active]:bg-gold/10 data-[state=active]:text-gold"
              data-ocid="stores.my_store.tab"
            >
              My Store
            </TabsTrigger>
          </TabsList>

          {/* Browse Stores Tab */}
          <TabsContent value="browse" className="mt-0">
            {/* Search bar */}
            <div className="relative mb-4" data-ocid="stores.search_input">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stores by name or location…"
                className="pl-9 pr-9 bg-secondary border-border focus:border-gold/60 font-body text-sm"
                data-ocid="stores.search_input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none"
                  aria-label="Clear search"
                  data-ocid="stores.search.button"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Result count */}
            {searchQuery && (
              <p className="text-xs font-body text-muted-foreground mb-3">
                {filteredStores.length} of {stores.length} stores
              </p>
            )}

            {/* Store list */}
            {stores.length === 0 && (
              <div className="text-center py-20" data-ocid="stores.empty_state">
                <StoreIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="font-display text-lg font-semibold text-foreground mb-1">
                  No stores yet
                </p>
                <p className="text-muted-foreground text-sm font-body">
                  Be the first to register a partner store
                </p>
              </div>
            )}

            {stores.length > 0 && filteredStores.length === 0 && (
              <div className="text-center py-16" data-ocid="stores.empty_state">
                <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-body text-muted-foreground text-sm">
                  No stores matching "{searchQuery}"
                </p>
              </div>
            )}

            <div className="space-y-3" data-ocid="stores.list">
              <AnimatePresence>
                {filteredStores.map((store, i) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    index={i}
                    onView={() => setSelectedStore(store)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* My Store Tab */}
          <TabsContent value="mystore" className="mt-0">
            {myStoreSaved && myStore ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* Saved store summary card */}
                <Card className="bg-card border-gold/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon />
                      <CardTitle className="font-display text-base text-gold">
                        Store Registered
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-0.5">
                        Store Name
                      </p>
                      <p className="font-display text-sm font-semibold text-foreground">
                        {myStore.storeName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-0.5">
                        Location
                      </p>
                      <p className="font-body text-sm text-foreground">
                        {myStore.location}
                      </p>
                    </div>
                    {myStore.description && (
                      <div>
                        <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-0.5">
                          Description
                        </p>
                        <p className="font-body text-sm text-muted-foreground line-clamp-3">
                          {myStore.description}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Button
                  variant="outline"
                  onClick={() => setMyStoreSaved(false)}
                  className="w-full border-gold/30 text-gold hover:bg-gold/10 font-body text-sm"
                  data-ocid="stores.my_store.edit_button"
                >
                  Edit Store Details
                </Button>
              </motion.div>
            ) : (
              <div>
                <div className="mb-5">
                  <h2 className="font-display text-base font-semibold text-foreground mb-1">
                    {myStore ? "Edit Your Store" : "Register Your Store"}
                  </h2>
                  <p className="text-muted-foreground text-xs font-body leading-relaxed">
                    {myStore
                      ? "Update your store details visible to all shoppers."
                      : "Fill in your store details so customers can find and browse your products."}
                  </p>
                </div>
                <MyStoreForm
                  userEmail={userEmail}
                  existingStore={myStore}
                  onSaved={handleStoreSaved}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ── Mini icon helper ─────────────────────────────────────────────────────────

function CheckCircleIcon() {
  return (
    <svg
      className="w-4 h-4 text-emerald-400 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
