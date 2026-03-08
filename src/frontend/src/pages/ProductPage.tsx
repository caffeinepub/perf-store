import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MessageSquare,
  ShoppingCart,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Perfume } from "../backend.d";
import {
  useAddToCart,
  useAverageRating,
  useReviewsForPerfume,
} from "../hooks/useQueries";

interface ProductPageProps {
  perfume: Perfume;
  onBack: () => void;
}

function StarDisplay({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const filled = Math.round(rating);
  const iconClass = size === "md" ? "w-4 h-4" : "w-3 h-3";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${iconClass} transition-colors ${
            star <= filled
              ? "fill-gold text-gold"
              : "fill-transparent text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}

function shortenPrincipal(
  principal: { toString: () => string } | string,
): string {
  const str = typeof principal === "string" ? principal : principal.toString();
  if (str.length <= 12) return str;
  return `${str.slice(0, 6)}…${str.slice(-4)}`;
}

function formatReviewDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  const date = new Date(ms);
  if (date.getFullYear() < 2020) {
    return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ProductPage({ perfume, onBack }: ProductPageProps) {
  const addToCart = useAddToCart();
  const { data: reviews, isLoading: reviewsLoading } = useReviewsForPerfume(
    perfume.id,
  );
  const { data: avgRating, isLoading: ratingLoading } = useAverageRating(
    perfume.id,
  );

  const handleAddToCart = async () => {
    try {
      await addToCart.mutateAsync({ perfumeId: perfume.id, quantity: 1n });
      toast.success(`${perfume.name} added to cart`, {
        icon: <CheckCircle2 className="text-gold w-4 h-4" />,
      });
      onBack();
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const reviewCount = reviews?.length ?? 0;
  const displayRating =
    typeof avgRating === "number" && avgRating > 0 ? avgRating : null;

  return (
    <div className="min-h-full bg-background" data-ocid="product.page">
      {/* Back header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground hover:text-gold -ml-2 font-body"
            data-ocid="product.link"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
      </header>

      <main className="pb-32">
        {/* Hero image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden"
        >
          <div className="aspect-[4/3] md:aspect-[16/7] bg-muted">
            <img
              src={perfume.imageUrl}
              alt={perfume.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </div>
        </motion.div>

        {/* Product info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="px-6 pt-6 pb-8"
        >
          {/* Name + price */}
          <div className="mb-4">
            <p className="text-gold text-xs font-body font-medium tracking-[0.3em] uppercase mb-2">
              Premium Fragrance
            </p>
            <h1 className="font-display text-3xl font-bold text-foreground leading-tight mb-2">
              {perfume.name}
            </h1>

            {/* Rating summary inline */}
            <div className="flex items-center gap-2 mb-3">
              {ratingLoading ? (
                <Skeleton className="h-4 w-24 bg-muted" />
              ) : displayRating !== null ? (
                <>
                  <StarDisplay rating={displayRating} size="sm" />
                  <span className="font-body text-sm text-gold font-semibold">
                    {displayRating.toFixed(1)}
                  </span>
                  <span className="font-body text-xs text-muted-foreground">
                    · {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                  </span>
                </>
              ) : (
                <span className="font-body text-xs text-muted-foreground/60">
                  No reviews yet
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-gold text-2xl font-body font-semibold">
                ${Number(perfume.price)}
              </span>
              <span className="text-muted-foreground text-sm font-body">
                per bottle
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border mb-6" />

          {/* Description placeholder */}
          <div className="mb-8">
            <h2 className="font-display text-sm font-semibold text-foreground mb-3 tracking-wide">
              About this Fragrance
            </h2>
            <p className="text-muted-foreground text-sm font-body leading-relaxed">
              An exquisite blend crafted for those who appreciate the finer
              things in life. Each bottle is a journey through layers of
              carefully curated notes that evolve throughout the day.
            </p>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {["Top Note", "Heart Note", "Base Note"].map((note) => (
              <div
                key={note}
                className="bg-card border border-border rounded-md p-3 text-center"
              >
                <p className="text-gold text-xs font-body font-medium tracking-wider uppercase mb-1">
                  {note}
                </p>
                <p className="text-foreground text-xs font-body">
                  {note === "Top Note"
                    ? "Bergamot"
                    : note === "Heart Note"
                      ? "Rose"
                      : "Sandalwood"}
                </p>
              </div>
            ))}
          </div>

          {/* ── Reviews Section ─────────────────────────────────────────────── */}
          <div
            className="border-t border-border pt-6"
            data-ocid="product.panel"
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-gold" />
              <h2 className="font-display text-base font-bold text-foreground">
                Customer Reviews
              </h2>
              {displayRating !== null && (
                <span className="ml-auto font-body text-sm text-gold font-semibold flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                  {displayRating.toFixed(1)}
                  <span className="text-muted-foreground font-normal text-xs">
                    · {reviewCount}
                  </span>
                </span>
              )}
            </div>

            {reviewsLoading ? (
              <div className="space-y-3" data-ocid="product.loading_state">
                {["r1", "r2"].map((k) => (
                  <div
                    key={k}
                    className="p-4 rounded-lg bg-card border border-border space-y-2"
                  >
                    <div className="flex gap-2 items-center">
                      <Skeleton className="h-3 w-20 bg-muted" />
                      <Skeleton className="h-3 w-16 bg-muted ml-auto" />
                    </div>
                    <Skeleton className="h-3 w-full bg-muted" />
                    <Skeleton className="h-3 w-2/3 bg-muted" />
                  </div>
                ))}
              </div>
            ) : !reviews || reviews.length === 0 ? (
              <div
                className="text-center py-10 rounded-lg border border-border/50 border-dashed"
                data-ocid="product.empty_state"
              >
                <Star className="text-muted-foreground w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-body text-sm text-muted-foreground">
                  No reviews yet
                </p>
                <p className="font-body text-xs text-muted-foreground/60 mt-1">
                  Purchase this fragrance and be the first to review it
                </p>
              </div>
            ) : (
              <div className="space-y-3" data-ocid="product.list">
                {reviews.map((review, i) => {
                  const ocidIndex = i + 1;
                  return (
                    <motion.div
                      key={String(review.id)}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-lg bg-card border border-border/60"
                      data-ocid={`product.review.item.${ocidIndex}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <StarDisplay
                            rating={Number(review.rating)}
                            size="sm"
                          />
                          <p className="font-body text-[11px] text-muted-foreground/60 mt-1">
                            {shortenPrincipal(review.reviewerPrincipal)}
                          </p>
                        </div>
                        <p className="font-body text-[11px] text-muted-foreground/50 flex-shrink-0">
                          {formatReviewDate(review.timestamp)}
                        </p>
                      </div>
                      {review.comment && (
                        <p className="font-body text-sm text-foreground/80 leading-relaxed mt-2">
                          "{review.comment}"
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
        <Button
          onClick={handleAddToCart}
          disabled={addToCart.isPending}
          className="w-full bg-gold text-primary-foreground hover:bg-gold-dim font-body font-semibold tracking-wider h-12 text-base"
          data-ocid="product.primary_button"
        >
          {addToCart.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart — ${Number(perfume.price)}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
