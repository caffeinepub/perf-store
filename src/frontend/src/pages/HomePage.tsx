import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import type { Perfume } from "../backend.d";
import { usePerfumes } from "../hooks/useQueries";

interface HomePageProps {
  onViewProduct: (perfume: Perfume) => void;
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
        <p className="text-gold text-sm font-body font-semibold mb-3">
          ${Number(perfume.price)}
        </p>
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

export function HomePage({ onViewProduct }: HomePageProps) {
  const { data: perfumes, isLoading, isError } = usePerfumes();

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

        {!isLoading && !isError && perfumes && perfumes.length === 0 && (
          <div className="text-center py-20" data-ocid="home.empty_state">
            <ShoppingBag className="text-muted-foreground w-12 h-12 mx-auto mb-4" />
            <p className="font-body text-muted-foreground">
              No fragrances available
            </p>
          </div>
        )}

        {!isLoading && !isError && perfumes && perfumes.length > 0 && (
          <div className="grid grid-cols-2 gap-3" data-ocid="home.list">
            {perfumes.map((perfume, i) => (
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
