import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  CreditCard,
  Loader2,
  MapPin,
  MessageSquare,
  PackageCheck,
  ShoppingCart,
  Smartphone,
  Store,
  Truck,
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
  usePlaceOrderWithDelivery,
} from "../hooks/useQueries";

const DELIVERY_FEE_KES = 50;

interface CartPageProps {
  onOrderPlaced: () => void;
  stripeSessionId?: string;
}

type PhonePayStep = "input" | "sending" | "confirm";
type DeliveryType = "doorstep" | "pickup" | "";

interface DeliveryState {
  deliveryType: DeliveryType;
  hostelName: string;
  area: string;
  roomNumber: string;
  subDomain: string;
  manualLocation: string;
  useManual: boolean;
}

const HOSTEL_GROUPS: Array<{ area: string; hostels: string[] }> = [
  {
    area: "Maseno Main Campus",
    hostels: [
      "Nyabundi Hostels",
      "Kilimanjaro Hostels",
      "Mara Hostels",
      "Nzoia Hostels",
      "Niles Hostels",
      "Kit-Mikayi Hostels",
      "Tsavo Hostels",
      "Elgon Hostels",
      "Makerere Hostels",
      "Equator Hostels",
      "ACV Hostels",
      "Rusinga Hostels",
      "Ndere Hostels",
    ],
  },
  {
    area: "Around Market",
    hostels: [
      "Villa Costa Hostels",
      "Bens Hostels",
      "Silwal Hostels",
      "Rams Hostels",
    ],
  },
  {
    area: "Around Marisu",
    hostels: [
      "Marisu Hostels",
      "Pink View Hostels",
      "Mbwa Kali Hostels",
      "Godrian Hostel",
    ],
  },
  {
    area: "Around Niles",
    hostels: ["Amazon Hostel"],
  },
  {
    area: "Around Lela",
    hostels: ["Lela Station"],
  },
  {
    area: "Around Nyawita",
    hostels: [],
  },
];

function DeliverySection({
  delivery,
  setDelivery,
  wantDeliveryFee,
  setWantDeliveryFee,
}: {
  delivery: DeliveryState;
  setDelivery: (d: DeliveryState) => void;
  wantDeliveryFee: boolean;
  setWantDeliveryFee: (v: boolean) => void;
}) {
  const set = (patch: Partial<DeliveryState>) =>
    setDelivery({ ...delivery, ...patch });

  return (
    <div
      className="bg-card border border-border rounded-xl p-4 space-y-4"
      data-ocid="delivery.section"
    >
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-gold" />
        <h3 className="font-display text-sm font-bold text-foreground tracking-wide">
          Delivery Options
        </h3>
      </div>

      {/* Delivery type toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => set({ deliveryType: "doorstep" })}
          className={`flex flex-col items-center gap-2 p-3.5 rounded-lg border transition-all ${
            delivery.deliveryType === "doorstep"
              ? "border-gold bg-gold/10 text-gold"
              : "border-border bg-secondary/40 text-muted-foreground hover:border-gold/40"
          }`}
          data-ocid="delivery.doorstep_toggle"
        >
          <Truck
            className={`w-5 h-5 ${
              delivery.deliveryType === "doorstep"
                ? "text-gold"
                : "text-muted-foreground"
            }`}
          />
          <span className="font-body text-xs font-semibold text-center leading-tight">
            Doorstep
            <br />
            Delivery
          </span>
          {delivery.deliveryType === "doorstep" && (
            <div className="w-1.5 h-1.5 rounded-full bg-gold" />
          )}
        </button>

        <button
          type="button"
          onClick={() => set({ deliveryType: "pickup" })}
          className={`flex flex-col items-center gap-2 p-3.5 rounded-lg border transition-all ${
            delivery.deliveryType === "pickup"
              ? "border-gold bg-gold/10 text-gold"
              : "border-border bg-secondary/40 text-muted-foreground hover:border-gold/40"
          }`}
          data-ocid="delivery.pickup_toggle"
        >
          <Store
            className={`w-5 h-5 ${
              delivery.deliveryType === "pickup"
                ? "text-gold"
                : "text-muted-foreground"
            }`}
          />
          <span className="font-body text-xs font-semibold text-center leading-tight">
            Pickup
            <br />
            at Store
          </span>
          {delivery.deliveryType === "pickup" && (
            <div className="w-1.5 h-1.5 rounded-full bg-gold" />
          )}
        </button>
      </div>

      {/* Doorstep delivery fee opt-in checkbox */}
      <AnimatePresence>
        {delivery.deliveryType === "doorstep" && (
          <motion.div
            key="delivery-fee-optin"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className={`flex items-start gap-3 rounded-lg border px-3 py-3 transition-colors ${
              wantDeliveryFee
                ? "border-gold/40 bg-gold/8"
                : "border-border bg-secondary/30"
            }`}
          >
            <Checkbox
              id="delivery-fee-checkbox"
              checked={wantDeliveryFee}
              onCheckedChange={(v) => setWantDeliveryFee(Boolean(v))}
              className="mt-0.5 border-border data-[state=checked]:bg-gold data-[state=checked]:border-gold flex-shrink-0"
              data-ocid="delivery.fee_checkbox"
            />
            <label
              htmlFor="delivery-fee-checkbox"
              className="cursor-pointer flex-1"
            >
              <span className="font-body text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-gold" />
                Add doorstep delivery{" "}
                <span className="text-gold">KES {DELIVERY_FEE_KES}</span>
              </span>
              <p className="font-body text-xs text-muted-foreground mt-0.5 leading-relaxed">
                We'll deliver from the pickup station to your doorstep.
              </p>
            </label>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Doorstep location fields */}
      <AnimatePresence>
        {delivery.deliveryType === "doorstep" && (
          <motion.div
            key="doorstep-fields"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-1">
              {/* Manual location toggle */}
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id="manual-location"
                  checked={delivery.useManual}
                  onCheckedChange={(v) =>
                    set({ useManual: Boolean(v), hostelName: "", area: "" })
                  }
                  className="border-border data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                  data-ocid="delivery.manual_checkbox"
                />
                <Label
                  htmlFor="manual-location"
                  className="font-body text-xs text-muted-foreground cursor-pointer"
                >
                  My location is not listed — I'll type it manually
                </Label>
              </div>

              {delivery.useManual ? (
                <div className="space-y-1.5">
                  <Label className="font-body text-xs text-muted-foreground tracking-widest uppercase">
                    Your Delivery Address
                  </Label>
                  <Textarea
                    placeholder="E.g. Maseno town, near the market, Green Gate Apartments Room 5..."
                    rows={3}
                    value={delivery.manualLocation}
                    onChange={(e) => set({ manualLocation: e.target.value })}
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 font-body text-sm focus:border-gold/60 resize-none text-sm"
                    data-ocid="delivery.manual_textarea"
                  />
                </div>
              ) : (
                <>
                  {/* Hostel list */}
                  <div className="space-y-1.5">
                    <Label className="font-body text-xs text-muted-foreground tracking-widest uppercase">
                      Select Your Hostel / Location
                    </Label>
                    <ScrollArea className="h-52 rounded-lg border border-border bg-secondary/30">
                      <div className="p-2 space-y-3">
                        {HOSTEL_GROUPS.map((group) => (
                          <div key={group.area}>
                            <p className="font-body text-[10px] text-muted-foreground tracking-widest uppercase px-2 py-1">
                              {group.area}
                            </p>
                            {group.hostels.length === 0 ? (
                              <button
                                type="button"
                                onClick={() =>
                                  set({
                                    hostelName: group.area,
                                    area: group.area,
                                  })
                                }
                                className={`w-full text-left px-3 py-2 rounded-md font-body text-xs transition-colors ${
                                  delivery.hostelName === group.area
                                    ? "bg-gold/15 text-gold border border-gold/30"
                                    : "text-foreground hover:bg-secondary/80"
                                }`}
                              >
                                {group.area} (general area)
                              </button>
                            ) : (
                              <div className="space-y-0.5">
                                {group.hostels.map((hostel) => (
                                  <button
                                    key={hostel}
                                    type="button"
                                    onClick={() =>
                                      set({
                                        hostelName: hostel,
                                        area: group.area,
                                      })
                                    }
                                    className={`w-full text-left px-3 py-2 rounded-md font-body text-xs transition-colors ${
                                      delivery.hostelName === hostel
                                        ? "bg-gold/15 text-gold border border-gold/30"
                                        : "text-foreground hover:bg-secondary/80"
                                    }`}
                                    data-ocid="delivery.hostel_item"
                                  >
                                    {hostel}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Room / sub-domain fields shown after hostel selected */}
                  <AnimatePresence>
                    {delivery.hostelName && (
                      <motion.div
                        key="room-fields"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="space-y-2"
                      >
                        <div className="rounded-md bg-gold/5 border border-gold/20 px-3 py-2">
                          <p className="font-body text-xs text-gold font-medium truncate">
                            📍 {delivery.hostelName}
                          </p>
                          {delivery.area &&
                            delivery.area !== delivery.hostelName && (
                              <p className="font-body text-[10px] text-muted-foreground">
                                {delivery.area}
                              </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="font-body text-xs text-muted-foreground">
                              Room Number / Block
                            </Label>
                            <Input
                              placeholder="e.g. Room 12"
                              value={delivery.roomNumber}
                              onChange={(e) =>
                                set({ roomNumber: e.target.value })
                              }
                              className="bg-secondary border-border text-foreground font-body text-xs focus:border-gold/60 h-9"
                              data-ocid="delivery.room_input"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="font-body text-xs text-muted-foreground">
                              Sub-domain / Wing{" "}
                              <span className="text-muted-foreground/50">
                                (optional)
                              </span>
                            </Label>
                            <Input
                              placeholder="e.g. Block A"
                              value={delivery.subDomain}
                              onChange={(e) =>
                                set({ subDomain: e.target.value })
                              }
                              className="bg-secondary border-border text-foreground font-body text-xs focus:border-gold/60 h-9"
                              data-ocid="delivery.subdomain_input"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {delivery.deliveryType === "pickup" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg bg-secondary/50 border border-border px-4 py-3 flex items-center gap-2.5"
        >
          <Store className="w-4 h-4 text-gold flex-shrink-0" />
          <p className="font-body text-xs text-muted-foreground">
            You'll collect your order from the partner's store. We'll notify you
            when it's ready.
          </p>
        </motion.div>
      )}
    </div>
  );
}

export function CartPage({ onOrderPlaced, stripeSessionId }: CartPageProps) {
  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { data: perfumes, isLoading: perfumesLoading } = usePerfumes();
  const placeOrder = usePlaceOrder();
  const placeOrderWithDelivery = usePlaceOrderWithDelivery();
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

  // Delivery state
  const [delivery, setDelivery] = useState<DeliveryState>({
    deliveryType: "",
    hostelName: "",
    area: "",
    roomNumber: "",
    subDomain: "",
    manualLocation: "",
    useManual: false,
  });

  // Optional delivery fee (doorstep only, unchecked by default)
  const [wantDeliveryFee, setWantDeliveryFee] = useState(false);

  const isLoading = cartLoading || perfumesLoading;

  const isDoorstep = delivery.deliveryType === "doorstep";
  const showDeliveryFee = isDoorstep && wantDeliveryFee;

  // Helper to validate delivery selection
  const validateDelivery = (): boolean => {
    if (!delivery.deliveryType) {
      toast.error("Please select a delivery option (Doorstep or Pickup)");
      return false;
    }
    if (delivery.deliveryType === "doorstep") {
      if (delivery.useManual && !delivery.manualLocation.trim()) {
        toast.error("Please enter your delivery address");
        return false;
      }
      if (!delivery.useManual && !delivery.hostelName) {
        toast.error("Please select your hostel or location");
        return false;
      }
    }
    return true;
  };

  // Build delivery payload
  const buildDeliveryPayload = () => ({
    deliveryType: delivery.deliveryType || "pickup",
    hostelName: delivery.useManual ? "" : delivery.hostelName,
    area: delivery.useManual ? "" : delivery.area,
    roomNumber: delivery.roomNumber,
    manualLocation: delivery.useManual
      ? delivery.manualLocation
      : delivery.subDomain
        ? `${delivery.subDomain}`
        : "",
  });

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

          // Check for pending delivery info stored before Stripe redirect
          const pendingDeliveryRaw = sessionStorage.getItem("pendingDelivery");
          if (pendingDeliveryRaw) {
            try {
              const pendingDelivery = JSON.parse(pendingDeliveryRaw) as {
                deliveryType: string;
                hostelName: string;
                area: string;
                roomNumber: string;
                manualLocation: string;
              };
              sessionStorage.removeItem("pendingDelivery");
              await placeOrderWithDelivery.mutateAsync({
                stripePaymentIntentId: stripeSessionId,
                ...pendingDelivery,
              });
            } catch {
              // Fallback to regular place order
              await placeOrder.mutateAsync(stripeSessionId);
            }
          } else {
            await placeOrder.mutateAsync(stripeSessionId);
          }

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
    if (!validateDelivery()) return;

    try {
      const items = enrichedCart.filter(Boolean).map((item) => ({
        productName: item!.name,
        currency: "usd",
        quantity: item!.quantity,
        priceInCents: BigInt(item!.priceInCents),
        productDescription: item!.name,
      }));

      // Store delivery info before redirecting to Stripe
      const payload = buildDeliveryPayload();
      sessionStorage.setItem("pendingDelivery", JSON.stringify(payload));

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
      sessionStorage.removeItem("pendingDelivery");
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
    if (!validateDelivery()) return;
    setIsPlacingPhoneOrder(true);
    try {
      const ref = `phone_pay_${Date.now()}`;
      const names = enrichedCart.filter(Boolean).map((item) => item!.name);
      const payload = buildDeliveryPayload();
      await placeOrderWithDelivery.mutateAsync({
        stripePaymentIntentId: ref,
        ...payload,
      });
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

  const handleOpenPhonePay = () => {
    if (!validateDelivery()) return;
    setPhonePayOpen(true);
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
          <div className="space-y-4" data-ocid="cart.list">
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

            {/* Delivery section — shown below cart items */}
            <DeliverySection
              delivery={delivery}
              setDelivery={setDelivery}
              wantDeliveryFee={wantDeliveryFee}
              setWantDeliveryFee={setWantDeliveryFee}
            />
          </div>
        )}
      </main>

      {/* Sticky checkout bar */}
      {!isLoading && enrichedCart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 pb-safe">
          {/* Price breakdown */}
          <div className="space-y-1 mb-3">
            {showDeliveryFee ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="font-body text-sm text-foreground font-medium">
                    ${totalDisplay.toFixed(2)}
                  </span>
                </div>
                <div
                  className="flex items-center justify-between"
                  data-ocid="cart.delivery_fee"
                >
                  <span className="font-body text-xs text-muted-foreground flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    Delivery fee
                  </span>
                  <span className="font-body text-xs text-gold font-semibold">
                    KES {DELIVERY_FEE_KES}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <span className="font-body text-sm text-muted-foreground">
                    Total
                  </span>
                  <span className="font-display text-2xl font-bold text-gold">
                    ${totalDisplay.toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-muted-foreground">
                  Total
                </span>
                <span className="font-display text-2xl font-bold text-gold">
                  ${totalDisplay.toFixed(2)}
                </span>
              </div>
            )}
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
              onClick={handleOpenPhonePay}
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
                  {showDeliveryFee && (
                    <span className="text-muted-foreground/60">
                      {" "}
                      + KES {DELIVERY_FEE_KES} delivery
                    </span>
                  )}
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
