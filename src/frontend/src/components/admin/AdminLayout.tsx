import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  type EarningsTransaction,
  type PartnerSubmission,
  type ProductSubmission,
  type StoreSubmission,
  initialPartners,
  initialProducts,
  initialStores,
  initialTransactions,
} from "../../data/adminData";
import { DashboardPage } from "../../pages/admin/DashboardPage";
import { EarningsPage } from "../../pages/admin/EarningsPage";
import { PartnerSubmissionsPage } from "../../pages/admin/PartnerSubmissionsPage";
import { ProductSubmissionsPage } from "../../pages/admin/ProductSubmissionsPage";
import { StoreSubmissionsPage } from "../../pages/admin/StoreSubmissionsPage";
import { AdminSidebar } from "./AdminSidebar";

export type AdminPage =
  | "dashboard"
  | "partners"
  | "stores"
  | "products"
  | "earnings";

interface Props {
  onLogout: () => void;
}

export function AdminLayout({ onLogout }: Props) {
  const [activePage, setActivePage] = useState<AdminPage>("dashboard");
  const [partners, setPartners] =
    useState<PartnerSubmission[]>(initialPartners);
  const [stores, setStores] = useState<StoreSubmission[]>(initialStores);
  const [products, setProducts] =
    useState<ProductSubmission[]>(initialProducts);
  const [transactions, setTransactions] =
    useState<EarningsTransaction[]>(initialTransactions);

  const updatePartnerStatus = (
    id: number,
    status: "approved" | "rejected",
    notes?: string,
  ) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status, notes } : p)),
    );
  };

  const updateStoreStatus = (
    id: number,
    status: "approved" | "rejected",
    notes?: string,
  ) => {
    setStores((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, notes } : s)),
    );
  };

  const updateProductStatus = (
    id: number,
    status: "approved" | "rejected",
    notes?: string,
  ) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status, notes } : p)),
    );
  };

  const addTransaction = (tx: Omit<EarningsTransaction, "id" | "date">) => {
    setTransactions((prev) => [
      {
        ...tx,
        id: prev.length + 1,
        date: new Date().toISOString().split("T")[0],
      },
      ...prev,
    ]);
  };

  const pageProps = {
    partners,
    stores,
    products,
    transactions,
    onUpdatePartnerStatus: updatePartnerStatus,
    onUpdateStoreStatus: updateStoreStatus,
    onUpdateProductStatus: updateProductStatus,
    onAddTransaction: addTransaction,
    onNavigate: setActivePage,
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={onLogout}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
          <div>
            <h1 className="font-display text-lg font-bold text-foreground capitalize">
              {activePage === "dashboard"
                ? "Dashboard"
                : activePage === "partners"
                  ? "Partner Submissions"
                  : activePage === "stores"
                    ? "Store Submissions"
                    : activePage === "products"
                      ? "Product Submissions"
                      : "Earnings"}
            </h1>
            <p className="font-body text-xs text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString("en-KE", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="font-body text-sm font-semibold text-foreground">
                Admin
              </p>
              <p className="font-body text-xs text-muted-foreground">
                admin@perfstore.com
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <span className="font-display text-sm font-bold text-primary-foreground">
                A
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activePage === "dashboard" && <DashboardPage {...pageProps} />}
              {activePage === "partners" && (
                <PartnerSubmissionsPage {...pageProps} />
              )}
              {activePage === "stores" && (
                <StoreSubmissionsPage {...pageProps} />
              )}
              {activePage === "products" && (
                <ProductSubmissionsPage {...pageProps} />
              )}
              {activePage === "earnings" && <EarningsPage {...pageProps} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
