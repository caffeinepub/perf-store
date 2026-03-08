import { Toaster } from "@/components/ui/sonner";
import { Home, Loader2, Receipt, ShoppingCart, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Perfume } from "./backend.d";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { CartPage } from "./pages/CartPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { OrdersPage } from "./pages/OrdersPage";
import { PartnerPage } from "./pages/PartnerPage";
import { ProductPage } from "./pages/ProductPage";
import { SignupPage } from "./pages/SignupPage";

type AuthView = "login" | "signup";
type MainTab = "home" | "cart" | "orders" | "partner";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [authView, setAuthView] = useState<AuthView>("login");
  const [activeTab, setActiveTab] = useState<MainTab>("home");
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);

  // Initializing spinner
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-gold w-8 h-8 animate-spin mx-auto mb-3" />
          <p className="font-body text-muted-foreground text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  // Unauthenticated
  if (!identity) {
    return (
      <>
        <AnimatePresence mode="wait">
          {authView === "login" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <LoginPage onNavigateToSignup={() => setAuthView("signup")} />
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <SignupPage onNavigateToLogin={() => setAuthView("login")} />
            </motion.div>
          )}
        </AnimatePresence>
        <Toaster />
      </>
    );
  }

  // Product detail overlay
  if (selectedPerfume) {
    return (
      <>
        <ProductPage
          perfume={selectedPerfume}
          onBack={() => setSelectedPerfume(null)}
        />
        <Toaster />
      </>
    );
  }

  // Authenticated main app
  const tabs: { id: MainTab; label: string; Icon: typeof Home }[] = [
    { id: "home", label: "Home", Icon: Home },
    { id: "cart", label: "Cart", Icon: ShoppingCart },
    { id: "orders", label: "Orders", Icon: Receipt },
    { id: "partner", label: "Partners", Icon: Users },
  ];

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Main content */}
        <div className="flex-1 pb-20 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === "home" && (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <HomePage onViewProduct={setSelectedPerfume} />
              </motion.div>
            )}
            {activeTab === "cart" && (
              <motion.div
                key="cart"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CartPage onOrderPlaced={() => setActiveTab("orders")} />
              </motion.div>
            )}
            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <OrdersPage />
              </motion.div>
            )}
            {activeTab === "partner" && (
              <motion.div
                key="partner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <PartnerPage />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom tab bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border">
          <div className="flex items-stretch">
            {tabs.map(({ id, label, Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className="flex-1 flex flex-col items-center justify-center py-3 gap-1 relative transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  data-ocid={`nav.${id}.tab`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gold rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <Icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive ? "text-gold" : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-body font-medium tracking-wide transition-colors duration-200 ${
                      isActive ? "text-gold" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Footer */}
      <footer className="hidden">
        <p>
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      <Toaster />
    </>
  );
}
