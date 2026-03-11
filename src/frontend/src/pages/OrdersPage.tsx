import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  MessageSquarePlus,
  Package,
  Receipt,
  RefreshCw,
  Star,
  Store,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { RefundRequest } from "../backend.d";
import {
  useMyOrderDeliveries,
  useMyRefundRequests,
  useOrders,
  usePerfumes,
  useSubmitRefundRequest,
  useSubmitReview,
} from "../hooks/useQueries";

// ── Star Picker ──────────────────────────────────────────────────────────────

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <fieldset className="flex gap-1 border-0 p-0 m-0" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm transition-transform duration-100 hover:scale-110 active:scale-95"
        >
          <Star
            className={`w-7 h-7 transition-colors duration-100 ${
              (hovered || value) >= star
                ? "fill-gold text-gold"
                : "fill-transparent text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </fieldset>
  );
}

// ── Refund badge ─────────────────────────────────────────────────────────────

function RefundStatusBadge({ status }: { status: string }) {
  if (status === "pending") {
    return (
      <Badge className="bg-secondary text-gold border-gold/30 font-body text-[10px] flex items-center gap-1">
        <Clock className="w-2.5 h-2.5" />
        Refund Pending
      </Badge>
    );
  }
  if (status === "approved") {
    return (
      <Badge className="bg-emerald-950/50 text-emerald-400 border-emerald-500/30 font-body text-[10px] flex items-center gap-1">
        <CheckCircle className="w-2.5 h-2.5" />
        Refund Approved
      </Badge>
    );
  }
  if (status === "rejected") {
    return (
      <Badge className="bg-destructive/10 text-destructive border-destructive/30 font-body text-[10px] flex items-center gap-1">
        <XCircle className="w-2.5 h-2.5" />
        Refund Rejected
      </Badge>
    );
  }
  return null;
}

const REFUND_REASONS = [
  "Wrong item",
  "Damaged product",
  "Never arrived",
  "Not as described",
  "Other",
];

export function OrdersPage() {
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: perfumes } = usePerfumes();
  const { data: myRefundRequests } = useMyRefundRequests();
  const { data: orderDeliveries } = useMyOrderDeliveries();
  const submitRefund = useSubmitRefundRequest();
  const submitReview = useSubmitReview();

  // Refund dialog state
  const [refundOrderId, setRefundOrderId] = useState<bigint | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundDescription, setRefundDescription] = useState("");

  // Review dialog state
  const [reviewTarget, setReviewTarget] = useState<{
    perfumeId: bigint;
    orderId: bigint;
    perfumeName: string;
  } | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const isLoading = ordersLoading;

  const formatDate = (timestamp: bigint) => {
    const ms = Number(timestamp) / 1_000_000;
    const date = new Date(ms);
    if (date.getFullYear() < 2020) {
      return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Build a map: orderId → RefundRequest for quick lookup
  const refundMap = new Map<string, RefundRequest>();
  if (myRefundRequests) {
    for (const r of myRefundRequests) {
      refundMap.set(String(r.orderId), r);
    }
  }

  // Build a map: orderId → DeliveryInfo from the separate deliveries query
  const deliveryMap = new Map(
    (orderDeliveries ?? []).map(([id, info]) => [String(id), info]),
  );

  const perfumeMap = new Map(perfumes?.map((p) => [String(p.id), p]) ?? []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const openRefundDialog = (orderId: bigint) => {
    setRefundOrderId(orderId);
    setRefundReason("");
    setRefundDescription("");
  };

  const closeRefundDialog = () => {
    setRefundOrderId(null);
    setRefundReason("");
    setRefundDescription("");
  };

  const handleRefundSubmit = async () => {
    if (!refundOrderId) return;
    if (!refundReason) {
      toast.error("Please select a reason for the refund");
      return;
    }
    try {
      await submitRefund.mutateAsync({
        orderId: refundOrderId,
        reason: refundReason,
        description: refundDescription.trim(),
      });
      toast.success("Refund request submitted successfully");
      closeRefundDialog();
    } catch {
      toast.error("Failed to submit refund request. Please try again.");
    }
  };

  const openReviewDialog = (
    perfumeId: bigint,
    orderId: bigint,
    perfumeName: string,
  ) => {
    setReviewTarget({ perfumeId, orderId, perfumeName });
    setReviewRating(0);
    setReviewComment("");
  };

  const closeReviewDialog = () => {
    setReviewTarget(null);
    setReviewRating(0);
    setReviewComment("");
  };

  const handleReviewSubmit = async () => {
    if (!reviewTarget) return;
    if (reviewRating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    try {
      await submitReview.mutateAsync({
        perfumeId: reviewTarget.perfumeId,
        orderId: reviewTarget.orderId,
        rating: BigInt(reviewRating),
        comment: reviewComment.trim(),
      });
      toast.success("Review submitted — thank you!");
      closeReviewDialog();
    } catch {
      toast.error("Failed to submit review. Please try again.");
    }
  };

  return (
    <div className="min-h-full bg-background" data-ocid="orders.page">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center gap-2">
            <Receipt className="text-gold w-5 h-5" />
            <h1 className="font-display text-xl font-bold text-foreground">
              Orders
            </h1>
          </div>
          <p className="text-muted-foreground text-xs font-body mt-0.5 tracking-widest uppercase">
            Your order history
          </p>
        </div>
      </header>

      <main className="px-4 py-6">
        {isLoading && (
          <div className="space-y-3" data-ocid="orders.loading_state">
            {["o1", "o2", "o3"].map((key) => (
              <div
                key={key}
                className="bg-card border border-border rounded-lg p-5 space-y-3"
              >
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24 bg-muted" />
                  <Skeleton className="h-4 w-20 bg-muted" />
                </div>
                <Skeleton className="h-3 w-32 bg-muted" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-16 bg-muted" />
                  <Skeleton className="h-6 w-20 bg-muted rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && (!orders || orders.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
            data-ocid="orders.empty_state"
          >
            <Package className="text-muted-foreground w-16 h-16 mx-auto mb-4 opacity-40" />
            <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
              No orders yet
            </h2>
            <p className="text-muted-foreground text-sm font-body">
              Your purchase history will appear here
            </p>
          </motion.div>
        )}

        {!isLoading && orders && orders.length > 0 && (
          <div className="space-y-3" data-ocid="orders.list">
            {orders.map((order, i) => {
              const ocidIndex = i + 1;
              const existingRefund = refundMap.get(String(order.id));
              const hasActiveRefund = !!existingRefund;
              const deliveryInfo = deliveryMap.get(String(order.id));

              return (
                <motion.div
                  key={String(order.id)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-card border border-border rounded-lg p-5 hover:border-gold/30 transition-colors"
                  data-ocid={`orders.item.${ocidIndex}`}
                >
                  {/* Order header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-body text-xs text-muted-foreground tracking-widest uppercase mb-1">
                        Order #{String(order.id).padStart(4, "0")}
                      </p>
                      <p className="font-body text-xs text-muted-foreground/70">
                        {formatDate(order.timestamp)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="bg-secondary text-secondary-foreground text-xs font-body font-medium px-2.5 py-1 rounded-full border border-border">
                        Delivered
                      </span>
                      {hasActiveRefund && existingRefund && (
                        <RefundStatusBadge status={existingRefund.status} />
                      )}
                    </div>
                  </div>

                  {/* Items list */}
                  {order.items.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {order.items.map((item, itemIdx) => {
                        const perfume = perfumeMap.get(String(item.perfumeId));
                        const perfumeName =
                          perfume?.name ?? `Item #${String(item.perfumeId)}`;
                        return (
                          <div
                            key={`${String(order.id)}-item-${itemIdx}`}
                            className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-secondary/40 border border-border/40"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {perfume?.imageUrl && (
                                <img
                                  src={perfume.imageUrl}
                                  alt={perfumeName}
                                  className="w-8 h-8 rounded object-cover flex-shrink-0"
                                />
                              )}
                              <div className="min-w-0">
                                <p className="font-body text-xs font-medium text-foreground truncate">
                                  {perfumeName}
                                </p>
                                <p className="font-body text-[10px] text-muted-foreground">
                                  Qty: {String(item.quantity)}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                openReviewDialog(
                                  item.perfumeId,
                                  order.id,
                                  perfumeName,
                                )
                              }
                              className="text-muted-foreground hover:text-gold font-body text-[10px] tracking-wide h-7 px-2 flex-shrink-0"
                              data-ocid={`orders.review.button.${ocidIndex}`}
                            >
                              <Star className="w-3 h-3 mr-1" />
                              Review
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Delivery info (from separate deliveries map) */}
                  {deliveryInfo && (
                    <div className="mb-3 px-2.5 py-2 rounded-md bg-secondary/20 border border-border/30 flex items-start gap-2">
                      {deliveryInfo.deliveryType === "pickup" ? (
                        <>
                          <Store className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <p className="font-body text-xs text-muted-foreground">
                            Pickup at store
                          </p>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-gold/70 flex-shrink-0 mt-0.5" />
                          <p className="font-body text-xs text-muted-foreground">
                            {deliveryInfo.manualLocation
                              ? deliveryInfo.manualLocation
                              : [
                                  deliveryInfo.hostelName,
                                  deliveryInfo.roomNumber
                                    ? `Room ${deliveryInfo.roomNumber}`
                                    : null,
                                  deliveryInfo.area &&
                                  deliveryInfo.area !== deliveryInfo.hostelName
                                    ? deliveryInfo.area
                                    : null,
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-border mb-3" />

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Package className="w-3.5 h-3.5" />
                        <span className="font-body text-xs">
                          {order.items.length}{" "}
                          {order.items.length === 1 ? "item" : "items"}
                        </span>
                      </div>
                      {!hasActiveRefund && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openRefundDialog(order.id)}
                          className="text-muted-foreground hover:text-destructive font-body text-[10px] tracking-wide h-6 px-2"
                          data-ocid={`orders.refund.button.${ocidIndex}`}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Refund
                        </Button>
                      )}
                    </div>
                    <p className="font-body font-semibold text-gold text-base">
                      ${Number(order.total).toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Refund Request Dialog ───────────────────────────────────────────── */}
      <Dialog
        open={refundOrderId !== null}
        onOpenChange={(open) => !open && closeRefundDialog()}
      >
        <DialogContent
          className="bg-card border-border max-w-sm mx-auto"
          data-ocid="orders.refund.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-gold" />
              Request a Refund
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="font-body text-xs text-muted-foreground tracking-widest uppercase">
                Reason *
              </Label>
              <Select value={refundReason} onValueChange={setRefundReason}>
                <SelectTrigger
                  className="bg-secondary border-border text-foreground font-body text-sm focus:border-gold/60"
                  data-ocid="orders.refund.select"
                >
                  <SelectValue placeholder="Select a reason…" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {REFUND_REASONS.map((r) => (
                    <SelectItem
                      key={r}
                      value={r}
                      className="font-body text-sm text-foreground focus:bg-secondary focus:text-gold"
                    >
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-body text-xs text-muted-foreground tracking-widest uppercase">
                Description
              </Label>
              <Textarea
                placeholder="Tell us more about the issue…"
                rows={3}
                value={refundDescription}
                onChange={(e) => setRefundDescription(e.target.value)}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 font-body text-sm focus:border-gold/60 resize-none"
                data-ocid="orders.refund.textarea"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 mt-2">
            <Button
              variant="outline"
              onClick={closeRefundDialog}
              className="flex-1 border-border text-muted-foreground hover:text-foreground font-body text-sm"
              data-ocid="orders.refund.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRefundSubmit}
              disabled={submitRefund.isPending || !refundReason}
              className="flex-1 bg-gold text-primary-foreground hover:bg-gold-deep font-body text-sm font-medium disabled:opacity-60"
              data-ocid="orders.refund.submit_button"
            >
              {submitRefund.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Review Dialog ──────────────────────────────────────────────────── */}
      <Dialog
        open={reviewTarget !== null}
        onOpenChange={(open) => !open && closeReviewDialog()}
      >
        <DialogContent
          className="bg-card border-border max-w-sm mx-auto"
          data-ocid="orders.review.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <MessageSquarePlus className="w-4 h-4 text-gold" />
              Leave a Review
            </DialogTitle>
            {reviewTarget && (
              <p className="font-body text-xs text-muted-foreground mt-1">
                {reviewTarget.perfumeName}
              </p>
            )}
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="font-body text-xs text-muted-foreground tracking-widest uppercase">
                Your Rating *
              </Label>
              <StarPicker value={reviewRating} onChange={setReviewRating} />
              {reviewRating > 0 && (
                <p className="font-body text-xs text-gold">
                  {reviewRating === 1
                    ? "Poor"
                    : reviewRating === 2
                      ? "Fair"
                      : reviewRating === 3
                        ? "Good"
                        : reviewRating === 4
                          ? "Very Good"
                          : "Excellent"}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="font-body text-xs text-muted-foreground tracking-widest uppercase">
                Comment
              </Label>
              <Textarea
                placeholder="Share your experience with this fragrance…"
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 font-body text-sm focus:border-gold/60 resize-none"
                data-ocid="orders.review.textarea"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 mt-2">
            <Button
              variant="outline"
              onClick={closeReviewDialog}
              className="flex-1 border-border text-muted-foreground hover:text-foreground font-body text-sm"
              data-ocid="orders.review.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReviewSubmit}
              disabled={submitReview.isPending || reviewRating === 0}
              className="flex-1 bg-gold text-primary-foreground hover:bg-gold-deep font-body text-sm font-medium disabled:opacity-60"
              data-ocid="orders.review.submit_button"
            >
              {submitReview.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
