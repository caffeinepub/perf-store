import { Skeleton } from "@/components/ui/skeleton";
import { Package, Receipt } from "lucide-react";
import { motion } from "motion/react";
import { useOrders } from "../hooks/useQueries";

export function OrdersPage() {
  const { data: orders, isLoading } = useOrders();

  const formatDate = (timestamp: bigint) => {
    // Motoko timestamps are in nanoseconds
    const ms = Number(timestamp) / 1_000_000;
    const date = new Date(ms);
    // If timestamp looks off (too small), treat as seconds
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
                    <span className="bg-secondary text-secondary-foreground text-xs font-body font-medium px-2.5 py-1 rounded-full border border-border">
                      Delivered
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border mb-3" />

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Package className="w-3.5 h-3.5" />
                      <span className="font-body text-xs">
                        {order.items.length}{" "}
                        {order.items.length === 1 ? "item" : "items"}
                      </span>
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
    </div>
  );
}
