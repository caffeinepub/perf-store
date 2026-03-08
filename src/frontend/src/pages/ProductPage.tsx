import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Loader2, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Perfume } from "../backend.d";
import { useAddToCart } from "../hooks/useQueries";

interface ProductPageProps {
  perfume: Perfume;
  onBack: () => void;
}

export function ProductPage({ perfume, onBack }: ProductPageProps) {
  const addToCart = useAddToCart();

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

      <main className="pb-24">
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
          <div className="mb-6">
            <p className="text-gold text-xs font-body font-medium tracking-[0.3em] uppercase mb-2">
              Premium Fragrance
            </p>
            <h1 className="font-display text-3xl font-bold text-foreground leading-tight mb-2">
              {perfume.name}
            </h1>
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
