import { Menu } from "lucide-react";
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
import { useDeviceMode } from "../../hooks/use-device-mode";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const deviceMode = useDeviceMode();

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

  const isDesktop = deviceMode === "desktop";

  const pageTitle =
    activePage === "dashboard"
      ? "Dashboard"
      : activePage === "partners"
        ? "Partner Submissions"
        : activePage === "stores"
          ? "Store Submissions"
          : activePage === "products"
            ? "Product Submissions"
            : "Earnings";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop: always-visible sidebar */}
      {isDesktop && (
        <AdminSidebar
          activePage={activePage}
          onNavigate={setActivePage}
          onLogout={onLogout}
        />
      )}

      {/* Mobile/Tablet: overlay sidebar */}
      {!isDesktop && (
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black/40"
                onClick={() => setSidebarOpen(false)}
              />
              {/* Sidebar panel */}
              <motion.div
                key="sidebar"
                initial={{ x: -256 }}
                animate={{ x: 0 }}
                exit={{ x: -256 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 z-50 h-full w-64"
              >
                <AdminSidebar
                  activePage={activePage}
                  onNavigate={setActivePage}
                  onLogout={onLogout}
                  onClose={() => setSidebarOpen(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger for non-desktop */}
            {!isDesktop && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                data-ocid="nav.open_modal_button"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="font-display text-lg font-bold text-foreground capitalize">
                {pageTitle}
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
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="font-body text-sm font-semibold text-foreground">
                Admin
              </p>
              <p className="font-body text-xs text-muted-foreground">
                lennydave2004@gmail.com
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
