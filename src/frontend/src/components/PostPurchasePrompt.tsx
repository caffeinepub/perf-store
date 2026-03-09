import { Button } from "@/components/ui/button";
import {
  Bell,
  BellRing,
  CheckCircle,
  Copy,
  Loader2,
  Receipt,
  Share2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────────

interface PostPurchasePromptProps {
  productNames: string[];
  onDismiss: () => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export function PostPurchasePrompt({
  productNames,
  onDismiss,
}: PostPurchasePromptProps) {
  const [notifGranted, setNotifGranted] = useState(false);
  const [notifRequesting, setNotifRequesting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const shareText =
    productNames.length > 0
      ? `I just bought ${productNames.join(", ")} from Perf Store! 🛍️`
      : "I just made a purchase from Perf Store! 🛍️";

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Perf Store Purchase",
          text: shareText,
          url: window.location.origin,
        });
        toast.success("Shared!");
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareText);
        toast.success("Copied to clipboard!");
      }
    } catch (err) {
      // User cancelled share or clipboard blocked
      if ((err as Error).name !== "AbortError") {
        toast.error("Could not share");
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleNotifications = async () => {
    if (!("Notification" in window)) {
      toast.error("Notifications are not supported in your browser");
      return;
    }
    if (Notification.permission === "granted") {
      setNotifGranted(true);
      return;
    }
    setNotifRequesting(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotifGranted(true);
        toast.success("Notifications enabled!");
      } else {
        toast.error("Notifications permission denied");
      }
    } catch {
      toast.error("Could not request notification permission");
    } finally {
      setNotifRequesting(false);
    }
  };

  const hasShareSupport = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4"
        data-ocid="post_purchase.dialog"
      >
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -12 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="bg-card border border-gold/20 rounded-2xl p-6 w-full max-w-sm shadow-gold-lg"
        >
          {/* Success header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
              className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </motion.div>
            <h2 className="font-display text-xl font-bold text-foreground mb-1">
              Order Confirmed!
            </h2>
            {productNames.length > 0 && (
              <p className="text-muted-foreground text-xs font-body leading-relaxed">
                {productNames.slice(0, 2).join(" & ")}
                {productNames.length > 2
                  ? ` + ${productNames.length - 2} more`
                  : ""}
              </p>
            )}
          </div>

          {/* Action rows */}
          <div className="space-y-3 mb-6">
            {/* Share */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border hover:border-gold/20 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                <Share2 className="w-4 h-4 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-body font-semibold text-foreground">
                  Share Purchase
                </p>
                <p className="text-[10px] font-body text-muted-foreground">
                  {hasShareSupport ? "Share with friends" : "Copy to clipboard"}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleShare}
                disabled={isSharing}
                className="border-gold/30 text-gold hover:bg-gold/10 text-xs h-8 px-3 font-body shrink-0"
                data-ocid="post_purchase.share.button"
              >
                {isSharing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : hasShareSupport ? (
                  <Share2 className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>

            {/* Notifications */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border hover:border-gold/20 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                {notifGranted ? (
                  <BellRing className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Bell className="w-4 h-4 text-gold" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-body font-semibold text-foreground">
                  {notifGranted ? "Notifications On" : "Enable Notifications"}
                </p>
                <p className="text-[10px] font-body text-muted-foreground">
                  {notifGranted
                    ? "You'll get order updates"
                    : "Stay updated on orders"}
                </p>
              </div>
              {!notifGranted && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleNotifications}
                  disabled={notifRequesting}
                  className="border-gold/30 text-gold hover:bg-gold/10 text-xs h-8 px-3 font-body shrink-0"
                  data-ocid="post_purchase.notification.button"
                >
                  {notifRequesting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Bell className="w-3 h-3" />
                  )}
                </Button>
              )}
              {notifGranted && (
                <span
                  className="text-emerald-400 shrink-0"
                  aria-label="Enabled"
                >
                  <BellRing className="w-4 h-4" />
                </span>
              )}
            </div>
          </div>

          {/* Continue CTA */}
          <Button
            onClick={onDismiss}
            className="w-full bg-gold text-primary-foreground hover:bg-gold-dim font-body font-semibold tracking-wider h-11"
            data-ocid="post_purchase.confirm_button"
          >
            <Receipt className="mr-2 h-4 w-4" />
            View My Orders
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
