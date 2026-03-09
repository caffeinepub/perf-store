import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Phone,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Perfume } from "../backend.d";
import { useAverageRating, usePerfumes } from "../hooks/useQueries";

interface HomePageProps {
  onViewProduct: (perfume: Perfume) => void;
  onNavigateToPartner?: () => void;
}

function ProductCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <Skeleton className="w-full aspect-[3/4] bg-muted" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4 bg-muted" />
        <Skeleton className="h-4 w-1/2 bg-muted" />
        <Skeleton className="h-9 w-full bg-muted mt-2" />
      </div>
    </div>
  );
}

// Fetch & display star rating for a single product card
function ProductRatingBadge({ perfumeId }: { perfumeId: bigint }) {
  const { data: avg, isLoading } = useAverageRating(perfumeId);

  if (isLoading) {
    return <Skeleton className="h-3.5 w-10 bg-muted rounded-full" />;
  }

  if (!avg || avg === 0) {
    return (
      <span className="font-body text-[10px] text-muted-foreground/50">
        No ratings
      </span>
    );
  }

  return (
    <span className="flex items-center gap-0.5 font-body text-[11px] text-gold font-semibold">
      <Star className="w-3 h-3 fill-gold text-gold" />
      {avg.toFixed(1)}
    </span>
  );
}

interface ProductCardProps {
  perfume: Perfume;
  index: number;
  onView: () => void;
}

function ProductCard({ perfume, index, onView }: ProductCardProps) {
  const ocidIndex = index + 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group bg-card border border-border rounded-lg overflow-hidden hover:border-gold/40 transition-all duration-300 hover:shadow-gold"
      data-ocid={`product.item.${ocidIndex}`}
    >
      {/* Image container */}
      <div className="relative overflow-hidden aspect-[3/4] bg-muted">
        <img
          src={perfume.imageUrl}
          alt={perfume.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Amber glow overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-display text-sm font-semibold text-foreground truncate mb-0.5">
          {perfume.name}
        </h3>
        <div className="flex items-center justify-between mb-2">
          <p className="text-gold text-sm font-body font-semibold">
            ${Number(perfume.price)}
          </p>
          <ProductRatingBadge perfumeId={perfume.id} />
        </div>
        <Button
          size="sm"
          onClick={onView}
          className="w-full bg-secondary hover:bg-gold hover:text-primary-foreground text-secondary-foreground border border-border hover:border-gold font-body text-xs tracking-wider transition-all duration-200"
          data-ocid={`product.button.${ocidIndex}`}
        >
          View
        </Button>
      </div>
    </motion.div>
  );
}

// Welcoming empty state for a brand-new store
function WelcomeEmptyState({
  onNavigateToPartner,
}: { onNavigateToPartner?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="flex flex-col items-center text-center px-6 py-14"
      data-ocid="home.empty_state"
    >
      {/* Glowing icon cluster */}
      <div className="relative mb-7">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-gold/10 blur-2xl scale-150 pointer-events-none" />
        <div className="relative w-20 h-20 rounded-full bg-card border border-gold/30 flex items-center justify-center shadow-[0_0_32px_rgba(212,175,55,0.18)]">
          <Sparkles className="w-9 h-9 text-gold" />
        </div>
        {/* Small badge */}
        <span className="absolute -bottom-2 -right-2 flex items-center justify-center w-7 h-7 rounded-full bg-gold text-background shadow-lg">
          <ShoppingBag className="w-3.5 h-3.5" />
        </span>
      </div>

      {/* Headline */}
      <h2 className="font-display text-2xl font-bold text-foreground mb-2 leading-tight">
        Welcome to <span className="text-gold">Perf Store</span>
      </h2>

      {/* Divider line */}
      <div className="w-12 h-px bg-gold/40 mb-4" />

      {/* Description */}
      <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-xs mb-2">
        The shelves are fresh and ready. No products are listed yet — this is
        your chance to be among the very first sellers.
      </p>
      <p className="font-body text-sm text-muted-foreground/70 leading-relaxed max-w-xs mb-8">
        If you have a business or are a partner, head over to the{" "}
        <span className="text-gold font-medium">Partners</span> tab to list your
        first product and start selling today.
      </p>

      {/* CTA */}
      {onNavigateToPartner && (
        <Button
          onClick={onNavigateToPartner}
          className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-background font-body font-semibold text-sm px-6 py-2.5 rounded-full shadow-[0_4px_20px_rgba(212,175,55,0.28)] transition-all duration-200 hover:shadow-[0_4px_28px_rgba(212,175,55,0.42)] active:scale-95"
          data-ocid="home.partner.primary_button"
        >
          <Users className="w-4 h-4" />
          List Your First Product
        </Button>
      )}

      {/* Subtle footnote */}
      <p className="mt-5 font-body text-[11px] text-muted-foreground/50 tracking-wide uppercase">
        Powered by LEMA · Perf Store
      </p>
    </motion.div>
  );
}

export function HomePage({
  onViewProduct,
  onNavigateToPartner,
}: HomePageProps) {
  const { data: perfumes, isLoading, isError } = usePerfumes();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPerfumes = useMemo(() => {
    if (!perfumes) return [];
    if (!searchQuery.trim()) return perfumes;
    const q = searchQuery.toLowerCase();
    return perfumes.filter((p) => p.name.toLowerCase().includes(q));
  }, [perfumes, searchQuery]);

  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <div className="min-h-full bg-background" data-ocid="home.page">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-gold w-5 h-5" />
            <h1 className="font-display text-xl font-bold text-foreground">
              Perf Store
            </h1>
          </div>
          <p className="text-muted-foreground text-xs font-body mt-0.5 tracking-widest uppercase">
            Luxury Fragrances
          </p>
        </div>
        {/* Search bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fragrances…"
              className="pl-9 pr-9 bg-secondary border-border focus:border-gold/60 font-body text-sm h-9"
              data-ocid="home.search_input"
            />
            {isSearchActive && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {isSearchActive && !isLoading && perfumes && (
            <p className="text-[10px] font-body text-muted-foreground mt-1.5">
              {filteredPerfumes.length} of {perfumes.length} results
            </p>
          )}
        </div>
      </header>

      <main className="px-4 py-6">
        {isError && (
          <div
            className="text-center py-16 text-destructive"
            data-ocid="home.error_state"
          >
            <p className="font-body">Failed to load fragrances</p>
          </div>
        )}

        {isLoading && (
          <div
            className="grid grid-cols-2 gap-3"
            data-ocid="home.loading_state"
          >
            {["s1", "s2", "s3", "s4", "s5", "s6"].map((key) => (
              <ProductCardSkeleton key={key} />
            ))}
          </div>
        )}

        {/* Brand-new store welcome state — shown when no products exist at all */}
        {!isLoading && !isError && perfumes && perfumes.length === 0 && (
          <WelcomeEmptyState onNavigateToPartner={onNavigateToPartner} />
        )}

        {/* Search returned no matches */}
        {!isLoading &&
          !isError &&
          isSearchActive &&
          filteredPerfumes.length === 0 &&
          perfumes &&
          perfumes.length > 0 && (
            <div className="text-center py-16" data-ocid="home.empty_state">
              <Search className="text-muted-foreground/40 w-12 h-12 mx-auto mb-3" />
              <p className="font-body text-muted-foreground">
                No fragrances found for "{searchQuery}"
              </p>
            </div>
          )}

        {!isLoading && !isError && filteredPerfumes.length > 0 && (
          <div className="grid grid-cols-2 gap-3" data-ocid="home.list">
            {filteredPerfumes.map((perfume, i) => (
              <ProductCard
                key={String(perfume.id)}
                perfume={perfume}
                index={i}
                onView={() => onViewProduct(perfume)}
              />
            ))}
          </div>
        )}

        {/* Service contact bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-6 mb-2"
        >
          <a
            href="tel:0756633420"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-secondary border border-gold/20 hover:border-gold/50 hover:bg-secondary/80 transition-all duration-200 group"
            data-ocid="home.link"
          >
            <Phone className="w-3.5 h-3.5 text-gold group-hover:scale-110 transition-transform duration-200" />
            <span className="font-body text-xs text-muted-foreground">
              Service:
            </span>
            <span className="font-body text-xs font-semibold text-gold tracking-wider">
              0756 633 420
            </span>
          </a>
        </motion.div>
      </main>
    </div>
  );
}
