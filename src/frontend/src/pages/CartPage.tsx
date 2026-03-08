import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  CreditCard,
  Loader2,
  PackageCheck,
  ShoppingCart,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import {
  useCart,
  useCreateCheckoutSession,
  usePerfumes,
  usePlaceOrder,
} from "../hooks/useQueries";

interface CartPageProps {
  onOrderPlaced: () => void;
  stripeSessionId?: string;
}

export function CartPage({ onOrderPlaced, stripeSessionId }: CartPageProps) {
  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { data: perfumes, isLoading: perfumesLoading } = usePerfumes();
  const placeOrder = usePlaceOrder();
  const createCheckout = useCreateCheckoutSession();
  const { actor } = useActor();

  const [sessionProcessed, setSessionProcessed] = useState(false);
  const [isProcessingReturn, setIsProcessingReturn] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const isLoading = cartLoading || perfumesLoading;

  // Handle Stripe return with session ID
  // biome-ignore lint/correctness/useExhaustiveDependencies: onOrderPlaced and placeOrder.mutateAsync are stable refs
  useEffect(() => {
    if (!stripeSessionId || sessionProcessed || !actor) return;

    const processSession = async () => {
      setIsProcessingReturn(true);
      setSessionProcessed(true);
      try {
        const status = await actor.getStripeSessionStatus(stripeSessionId);
        if (status.__kind__ === "completed") {
          await placeOrder.mutateAsync(stripeSessionId);
          setOrderSuccess(true);
          toast.success("Payment successful! Your order has been placed.");
          // Clean URL
          const url = new URL(window.location.href);
          url.searchParams.delete("session_id");
          window.history.replaceState({}, "", url.toString());
          setTimeout(() => {
            onOrderPlaced();
          }, 2000);
        } else if (status.__kind__ === "failed") {
          toast.error(`Payment failed: ${status.failed.error}`);
        }
      } catch (err) {
        console.error("Session processing error:", err);
        toast.error("Could not verify payment. Please contact support.");
      } finally {
        setIsProcessingReturn(false);
      }
    };

    processSession();
  }, [stripeSessionId, actor, sessionProcessed]);

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
                  // price is in cents, divide by 100 for display
                  priceInCents: Number(perfume.price),
                  priceDisplay: Number(perfume.price) / 100,
                  imageUrl: perfume.imageUrl,
                }
              : null;
          })
          .filter(Boolean)
      : [];

  const totalCents = enrichedCart.reduce(
    (sum, item) => sum + (item ? item.priceInCents * Number(item.quantity) : 0),
    0,
  );
  const totalDisplay = totalCents / 100;

  const handleCheckout = async () => {
    if (enrichedCart.length === 0) return;
    try {
      const items = enrichedCart.filter(Boolean).map((item) => ({
        productName: item!.name,
        currency: "usd",
        quantity: item!.quantity,
        priceInCents: BigInt(item!.priceInCents),
        productDescription: item!.name,
      }));

      const successUrl = `${window.location.origin}?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = window.location.origin;

      const checkoutUrl = await createCheckout.mutateAsync({
        items,
        successUrl,
        cancelUrl,
      });

      // Redirect to Stripe hosted checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Could not start checkout. Please try again.");
    }
  };

  // Show processing overlay when returning from Stripe
  if (isProcessingReturn) {
    return (
      <div
        className="min-h-full bg-background flex items-center justify-center"
        data-ocid="cart.loading_state"
      >
        <div className="text-center px-6">
          <Loader2 className="text-gold w-10 h-10 animate-spin mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            Verifying Payment
          </h2>
          <p className="font-body text-sm text-muted-foreground">
            Please wait while we confirm your transaction…
          </p>
        </div>
      </div>
    );
  }

  // Show success state
  if (orderSuccess) {
    return (
      <div
        className="min-h-full bg-background flex items-center justify-center"
        data-ocid="cart.success_state"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-6"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="text-emerald-400 w-10 h-10" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Order Confirmed
          </h2>
          <p className="font-body text-sm text-muted-foreground">
            Redirecting to your orders…
          </p>
        </motion.div>
      </div>
    );
  }

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
                        $
                        {(item.priceDisplay * Number(item.quantity)).toFixed(2)}
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
              ${totalDisplay.toFixed(2)}
            </span>
          </div>
          <Button
            onClick={handleCheckout}
            disabled={createCheckout.isPending}
            className="w-full bg-gold text-primary-foreground hover:bg-gold-dim font-body font-semibold tracking-wider h-12 text-base"
            data-ocid="cart.primary_button"
          >
            {createCheckout.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Preparing Checkout…
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Pay Securely
              </>
            )}
          </Button>
          <p className="text-center font-body text-[10px] text-muted-foreground/60 mt-2">
            Powered by Stripe · Secure payment
          </p>
        </div>
      )}
    </div>
  );
}
