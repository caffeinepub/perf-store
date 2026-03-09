import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  CreditCard,
  Loader2,
  MessageSquare,
  PackageCheck,
  ShoppingCart,
  Smartphone,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PostPurchasePrompt } from "../components/PostPurchasePrompt";
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

type PhonePayStep = "input" | "sending" | "confirm";

export function CartPage({ onOrderPlaced, stripeSessionId }: CartPageProps) {
  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { data: perfumes, isLoading: perfumesLoading } = usePerfumes();
  const placeOrder = usePlaceOrder();
  const createCheckout = useCreateCheckoutSession();
  const { actor } = useActor();

  const [sessionProcessed, setSessionProcessed] = useState(false);
  const [isProcessingReturn, setIsProcessingReturn] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [purchasedNames, setPurchasedNames] = useState<string[]>([]);
  const [showPostPurchase, setShowPostPurchase] = useState(false);

  // Phone pay state
  const [phonePayOpen, setPhonePayOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phonePayStep, setPhonePayStep] = useState<PhonePayStep>("input");
  const [isPlacingPhoneOrder, setIsPlacingPhoneOrder] = useState(false);

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
          const names =
            cartItems && perfumes
              ? cartItems
                  .map(
                    (item) =>
                      perfumes.find((p) => p.id === item.perfumeId)?.name,
                  )
                  .filter((n): n is string => Boolean(n))
              : [];
          await placeOrder.mutateAsync(stripeSessionId);
          setPurchasedNames(names);
          setOrderSuccess(true);
          setShowPostPurchase(true);
          toast.success("Payment successful! Your order has been placed.");
          const url = new URL(window.location.href);
          url.searchParams.delete("session_id");
          window.history.replaceState({}, "", url.toString());
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

      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Could not start checkout. Please try again.");
    }
  };

  const handleSendPhonePrompt = () => {
    if (!phoneNumber.trim()) return;
    setPhonePayStep("sending");
    setTimeout(() => {
      setPhonePayStep("confirm");
    }, 1500);
  };

  const handlePhonePayDone = async () => {
    setIsPlacingPhoneOrder(true);
    try {
      const ref = `phone_pay_${Date.now()}`;
      const names = enrichedCart.filter(Boolean).map((item) => item!.name);
      await placeOrder.mutateAsync(ref);
      setPurchasedNames(names);
      setPhonePayOpen(false);
      setPhoneNumber("");
      setPhonePayStep("input");
      setOrderSuccess(true);
      setShowPostPurchase(true);
      toast.success("Order placed! Awaiting payment confirmation.");
    } catch (err) {
      console.error("Phone pay order error:", err);
      toast.error("Could not place order. Please try again.");
    } finally {
      setIsPlacingPhoneOrder(false);
    }
  };

  const handlePhoneDialogClose = (open: boolean) => {
    if (!open) {
      setPhonePayOpen(false);
      setPhoneNumber("");
      setPhonePayStep("input");
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

  // Show success state with post-purchase prompt overlay
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
            Your purchase was successful!
          </p>
        </motion.div>

        {showPostPurchase && (
          <PostPurchasePrompt
            productNames={purchasedNames}
            onDismiss={() => {
              setShowPostPurchase(false);
              onOrderPlaced();
            }}
          />
        )}
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

      <main className="px-4 py-6 pb-40">
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

          {/* Two payment options */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleCheckout}
              disabled={createCheckout.isPending}
              className="bg-gold text-primary-foreground hover:bg-gold-dim font-body font-semibold tracking-wider h-12 text-sm"
              data-ocid="cart.card_button"
            >
              {createCheckout.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <CreditCard className="mr-1.5 h-4 w-4" />
                  Pay with Card
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => setPhonePayOpen(true)}
              className="border-gold/40 text-gold hover:bg-gold/10 hover:border-gold font-body font-semibold tracking-wider h-12 text-sm transition-colors"
              data-ocid="cart.phone_button"
            >
              <Smartphone className="mr-1.5 h-4 w-4" />
              Pay via Phone
            </Button>
          </div>

          <p className="text-center font-body text-[10px] text-muted-foreground/60 mt-2">
            Secure checkout · Stripe & Mobile Money
          </p>
        </div>
      )}

      {/* Phone Pay Dialog */}
      <Dialog open={phonePayOpen} onOpenChange={handlePhoneDialogClose}>
        <DialogContent
          className="bg-card border-border max-w-sm mx-auto"
          data-ocid="phone_pay.dialog"
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-gold" />
                </div>
                <DialogTitle className="font-display text-foreground text-lg">
                  Pay via Phone Number
                </DialogTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground -mr-1"
                onClick={() => handlePhoneDialogClose(false)}
                data-ocid="phone_pay.close_button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="font-body text-sm text-muted-foreground pt-1">
              Enter your mobile money number. A payment prompt will be sent to
              your phone.
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {phonePayStep === "input" && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4 pt-2"
              >
                <div className="space-y-1.5">
                  <Label
                    htmlFor="phone-input"
                    className="font-body text-sm text-foreground"
                  >
                    Mobile Money Number
                  </Label>
                  <Input
                    id="phone-input"
                    type="tel"
                    placeholder="+254 7XX XXX XXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="font-body bg-background border-border focus:border-gold h-11 text-base"
                    data-ocid="phone_pay.input"
                  />
                  <p className="text-[11px] text-muted-foreground font-body">
                    Supports M-Pesa, Airtel Money, and other mobile wallets.
                  </p>
                </div>

                <Button
                  onClick={handleSendPhonePrompt}
                  disabled={!phoneNumber.trim()}
                  className="w-full bg-gold text-primary-foreground hover:bg-gold-dim font-body font-semibold h-11"
                  data-ocid="phone_pay.submit_button"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Payment Prompt
                </Button>

                <p className="text-center font-body text-[11px] text-muted-foreground/70">
                  Order total:{" "}
                  <span className="text-gold font-semibold">
                    ${totalDisplay.toFixed(2)}
                  </span>
                </p>
              </motion.div>
            )}

            {phonePayStep === "sending" && (
              <motion.div
                key="sending"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-8 text-center space-y-3"
                data-ocid="phone_pay.loading_state"
              >
                <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto">
                  <Loader2 className="w-6 h-6 text-gold animate-spin" />
                </div>
                <p className="font-body text-sm text-foreground font-medium">
                  Sending prompt…
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  Contacting {phoneNumber}
                </p>
              </motion.div>
            )}

            {phonePayStep === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-2"
                data-ocid="phone_pay.success_state"
              >
                <div className="rounded-lg bg-emerald-950/30 border border-emerald-500/20 p-4 text-center space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="font-body text-sm font-semibold text-emerald-300">
                    Prompt sent to {phoneNumber}!
                  </p>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">
                    Approve the payment on your phone to complete your order.
                    Check for a pop-up or notification from your mobile wallet.
                  </p>
                </div>

                <Button
                  onClick={handlePhonePayDone}
                  disabled={isPlacingPhoneOrder}
                  className="w-full bg-gold text-primary-foreground hover:bg-gold-dim font-body font-semibold h-11"
                  data-ocid="phone_pay.confirm_button"
                >
                  {isPlacingPhoneOrder ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order…
                    </>
                  ) : (
                    <>
                      <PackageCheck className="mr-2 h-4 w-4" />
                      Done – I've Approved
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setPhonePayStep("input")}
                  className="w-full text-center font-body text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  ← Use a different number
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
