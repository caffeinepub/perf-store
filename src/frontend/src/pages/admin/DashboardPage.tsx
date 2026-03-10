import { TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import type { AdminPage } from "../../components/admin/AdminLayout";
import {
  StatusBadge,
  TransactionBadge,
} from "../../components/admin/StatusBadge";
import type {
  EarningsTransaction,
  PartnerSubmission,
  ProductSubmission,
  StoreSubmission,
} from "../../data/adminData";

interface Props {
  partners: PartnerSubmission[];
  stores: StoreSubmission[];
  products: ProductSubmission[];
  transactions: EarningsTransaction[];
  onNavigate: (page: AdminPage) => void;
}

export function DashboardPage({
  partners,
  stores,
  products,
  transactions,
  onNavigate,
}: Props) {
  const pendingPartners = partners.filter((p) => p.status === "pending").length;
  const approvedPartners = partners.filter(
    (p) => p.status === "approved",
  ).length;
  const pendingStores = stores.filter((s) => s.status === "pending").length;
  const pendingProducts = products.filter((p) => p.status === "pending").length;

  const totalCommission = transactions
    .filter((t) => t.type === "commission")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawn = transactions
    .filter((t) => t.type === "withdrawal")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDeposited = transactions
    .filter((t) => t.type === "deposit")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalCommission + totalDeposited - totalWithdrawn;

  // Today's earnings
  const today = new Date().toISOString().split("T")[0];
  const todayTxs = transactions.filter((t) => t.date === today);
  const todayCommission = todayTxs
    .filter((t) => t.type === "commission")
    .reduce((sum, t) => sum + t.amount, 0);
  const todayWithdrawals = todayTxs
    .filter((t) => t.type === "withdrawal")
    .reduce((sum, t) => sum + t.amount, 0);
  const todayNet = todayCommission - todayWithdrawals;

  const todayFormatted = new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const stats = [
    {
      label: "Pending Partners",
      value: pendingPartners,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      onClick: () => onNavigate("partners"),
    },
    {
      label: "Pending Stores",
      value: pendingStores,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      onClick: () => onNavigate("stores"),
    },
    {
      label: "Pending Products",
      value: pendingProducts,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
      onClick: () => onNavigate("products"),
    },
    {
      label: "Total Balance (KES)",
      value: `KES ${balance.toLocaleString()}`,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-100",
      onClick: () => onNavigate("earnings"),
    },
    {
      label: "Approved Partners",
      value: approvedPartners,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      onClick: () => onNavigate("partners"),
    },
    {
      label: "Total Commissions Earned",
      value: `KES ${totalCommission.toLocaleString()}`,
      color: "text-gold-deep",
      bg: "bg-amber-50",
      border: "border-amber-100",
      onClick: () => onNavigate("earnings"),
    },
  ];

  const recentActivity = [
    ...partners.map((p) => ({
      type: "partner" as const,
      label: `Partner: ${p.name}`,
      sub: p.businessType,
      status: p.status,
      date: p.submittedAt,
    })),
    ...stores.map((s) => ({
      type: "store" as const,
      label: `Store: ${s.storeName}`,
      sub: s.location,
      status: s.status,
      date: s.submittedAt,
    })),
    ...products.map((p) => ({
      type: "product" as const,
      label: `Product: ${p.productName}`,
      sub: p.partnerName,
      status: p.status,
      date: p.submittedAt,
    })),
  ]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);

  return (
    <div className="p-6 space-y-8">
      {/* Today's Earnings Hero */}
      <section className="mb-2" data-ocid="dashboard.card">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-100 text-xs font-body tracking-wider uppercase">
                Today's Earnings
              </p>
              <p className="font-display text-lg font-bold mt-0.5">
                {todayFormatted}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-200/60" />
          </div>

          {todayTxs.length === 0 ? (
            <p className="text-blue-200/70 text-sm font-body">
              No transactions recorded today
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-blue-100 text-[10px] font-body uppercase tracking-wider mb-1">
                  Commission
                </p>
                <p className="font-display text-xl font-bold">
                  KES {todayCommission.toLocaleString()}
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-blue-100 text-[10px] font-body uppercase tracking-wider mb-1">
                  Withdrawals
                </p>
                <p className="font-display text-xl font-bold">
                  KES {todayWithdrawals.toLocaleString()}
                </p>
              </div>
              <div
                className={`rounded-xl p-3 ${
                  todayNet >= 0 ? "bg-emerald-500/20" : "bg-red-500/20"
                }`}
              >
                <p className="text-blue-100 text-[10px] font-body uppercase tracking-wider mb-1">
                  Net
                </p>
                <p
                  className={`font-display text-xl font-bold ${
                    todayNet >= 0 ? "text-emerald-200" : "text-red-200"
                  }`}
                >
                  {todayNet >= 0 ? "+" : "-"}KES{" "}
                  {Math.abs(todayNet).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* Stats grid */}
      <section>
        <h2 className="font-display text-base font-bold text-foreground mb-4">
          Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.button
              key={stat.label}
              type="button"
              onClick={stat.onClick}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className={`text-left rounded-xl border ${stat.border} ${stat.bg} p-5 shadow-card hover:shadow-elevated transition-all duration-200 group cursor-pointer`}
            >
              <p className="font-body text-xs text-muted-foreground mb-2">
                {stat.label}
              </p>
              <p
                className={`font-display text-2xl font-bold ${stat.color} group-hover:scale-105 transition-transform origin-left`}
              >
                {stat.value}
              </p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <h2 className="font-display text-base font-bold text-foreground mb-4">
          Recent Activity
        </h2>
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          {recentActivity.length === 0 ? (
            <div
              className="py-12 text-center"
              data-ocid="dashboard.empty_state"
            >
              <p className="font-body text-sm text-muted-foreground">
                No recent activity
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentActivity.map((item, i) => (
                <div
                  key={`${item.type}-${i}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors"
                  data-ocid={`dashboard.item.${i + 1}`}
                >
                  <div className="min-w-0">
                    <p className="font-body text-sm font-medium text-foreground truncate">
                      {item.label}
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">
                      {item.sub} &middot; {item.date}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent transactions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-bold text-foreground">
            Recent Transactions
          </h2>
          <button
            type="button"
            onClick={() => onNavigate("earnings")}
            className="font-body text-xs text-primary hover:underline"
          >
            View all
          </button>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="divide-y divide-border">
            {transactions.slice(0, 5).map((tx, i) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-5 py-3.5"
                data-ocid={`dashboard.transaction.item.${i + 1}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <TransactionBadge type={tx.type} />
                  <div className="min-w-0">
                    <p className="font-body text-sm text-foreground truncate">
                      {tx.description}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      {tx.partner} &middot; {tx.date}
                    </p>
                  </div>
                </div>
                <p
                  className={`font-mono text-sm font-semibold shrink-0 ml-4 ${
                    tx.type === "withdrawal"
                      ? "text-destructive"
                      : "text-green-600"
                  }`}
                >
                  {tx.type === "withdrawal" ? "-" : "+"}KES{" "}
                  {tx.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
