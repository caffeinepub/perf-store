import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, PackageCheck, ShoppingCart } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { useCart, usePerfumes, usePlaceOrder } from "../hooks/useQueries";

interface CartPageProps {
  onOrderPlaced: () => void;
}

export function CartPage({ onOrderPlaced }: CartPageProps) {
  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { data: perfumes, isLoading: perfumesLoading } = usePerfumes();
  const placeOrder = usePlaceOrder();

  const isLoading = cartLoading || perfumesLoading;

  // Build enriched cart items
  const enrichedCart =
    cartItems && perfumes
      ? cartItems
          .map((item) => {
            const perfume = perfumes.find((p) => p.id === item.perfumeId);
            return perfume
              ? {
                  ...item,
                  name: perfume.name,
                  price: Number(perfume.price),
                  imageUrl: perfume.imageUrl,
                }
              : null;
          })
          .filter(Boolean)
      : [];

  const total = enrichedCart.reduce(
    (sum, item) => sum + (item ? item.price * Number(item.quantity) : 0),
    0,
  );

  const handleCheckout = async () => {
    if (enrichedCart.length === 0) return;
    try {
      await placeOrder.mutateAsync();
      toast.success("Order placed successfully!");
      onOrderPlaced();
    } catch {
      toast.error("Checkout failed. Please try again.");
    }
  };

  return (
    <div className="min-h-full bg-background" data-ocid="cart.page">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-gold w-5 h-5" />
            <h1 className="font-display text-xl font-bold text-foreground">
              Cart
            </h1>
            {enrichedCart.length > 0 && (
              <span className="bg-gold text-primary-foreground text-xs font-body font-semibold px-2 py-0.5 rounded-full ml-auto">
                {enrichedCart.length}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 py-6 pb-32">
        {isLoading && (
          <div className="space-y-3" data-ocid="cart.loading_state">
            {["c1", "c2", "c3"].map((key) => (
              <div
                key={key}
                className="flex items-center gap-4 bg-card border border-border rounded-lg p-4"
              >
                <Skeleton className="w-16 h-16 rounded-md bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-muted" />
                  <Skeleton className="h-4 w-1/4 bg-muted" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && enrichedCart.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
            data-ocid="cart.empty_state"
          >
            <ShoppingCart className="text-muted-foreground w-16 h-16 mx-auto mb-4 opacity-40" />
            <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground text-sm font-body">
              Discover our collection and add some fragrances
            </p>
          </motion.div>
        )}

        {!isLoading && enrichedCart.length > 0 && (
          <div className="space-y-3" data-ocid="cart.list">
            <AnimatePresence>
              {enrichedCart.map((item, i) => {
                if (!item) return null;
                const ocidIndex = i + 1;
                return (
                  <motion.div
                    key={`${String(item.perfumeId)}-${i}`}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-4 bg-card border border-border rounded-lg p-4 hover:border-gold/30 transition-colors"
                    data-ocid={`cart.item.${ocidIndex}`}
                  >
                    <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm font-semibold text-foreground truncate">
                        {item.name}
                      </p>
                      <p className="text-muted-foreground text-xs font-body mt-0.5">
                        Qty: {Number(item.quantity)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-gold font-body font-semibold text-sm">
                        ${item.price * Number(item.quantity)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Sticky checkout bar */}
      {!isLoading && enrichedCart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 pb-safe">
          <div className="flex items-center justify-between mb-3">
            <span className="font-body text-sm text-muted-foreground">
              Total
            </span>
            <span className="font-display text-2xl font-bold text-gold">
              ${total.toFixed(2)}
            </span>
          </div>
          <Button
            onClick={handleCheckout}
            disabled={placeOrder.isPending}
            className="w-full bg-gold text-primary-foreground hover:bg-gold-dim font-body font-semibold tracking-wider h-12 text-base"
            data-ocid="cart.primary_button"
          >
            {placeOrder.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <PackageCheck className="mr-2 h-5 w-5" />
                Checkout
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
