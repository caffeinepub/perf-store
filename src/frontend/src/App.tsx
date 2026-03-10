import { Toaster } from "@/components/ui/sonner";
import {
  Home,
  LogOut,
  Mail,
  Menu,
  Phone,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Perfume } from "./backend.d";
import { PostPurchasePrompt } from "./components/PostPurchasePrompt";
import { useActor } from "./hooks/useActor";
import { CartPage } from "./pages/CartPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { OrdersPage } from "./pages/OrdersPage";
import { PartnerPage } from "./pages/PartnerPage";
import { ProductPage } from "./pages/ProductPage";
import { SignupPage } from "./pages/SignupPage";
import { StoresPage } from "./pages/StoresPage";

type AuthView = "login" | "signup" | "forgot";
type AppTab = "home" | "stores" | "cart" | "orders" | "partners";

const TABS: {
  id: AppTab;
  label: string;
  icon: React.ReactNode;
  shortcut: string;
  key: string;
}[] = [
  {
    id: "home",
    label: "Home",
    icon: <Home className="w-5 h-5" />,
    shortcut: "Alt+H",
    key: "h",
  },
  {
    id: "stores",
    label: "Stores",
    icon: <Store className="w-5 h-5" />,
    shortcut: "Alt+S",
    key: "s",
  },
  {
    id: "cart",
    label: "Cart",
    icon: <ShoppingCart className="w-5 h-5" />,
    shortcut: "Alt+C",
    key: "c",
  },
  {
    id: "orders",
    label: "Orders",
    icon: <ShoppingBag className="w-5 h-5" />,
    shortcut: "Alt+O",
    key: "o",
  },
  {
    id: "partners",
    label: "Partners",
    icon: <Users className="w-5 h-5" />,
    shortcut: "Alt+P",
    key: "p",
  },
];

function WelcomeModal({
  onClose,
  onGoToPartners,
}: {
  onClose: () => void;
  onGoToPartners: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      data-ocid="welcome.modal"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-card border border-gold/30 rounded-2xl p-8 max-w-sm w-full shadow-2xl"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-gold" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Welcome to <span className="text-gold">Perf Store</span>
          </h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            Discover luxury fragrances or list your own products as a partner.
            Start exploring now.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-gold text-background font-body font-semibold text-sm hover:bg-gold/90 transition-colors"
            data-ocid="welcome.primary_button"
          >
            Start Shopping
          </button>
          <button
            type="button"
            onClick={onGoToPartners}
            className="w-full py-2.5 rounded-lg border border-gold/30 text-gold font-body font-semibold text-sm hover:bg-gold/5 transition-colors"
            data-ocid="welcome.secondary_button"
          >
            Become a Partner
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const { actor } = useActor();

  // Auth state
  const [authView, setAuthView] = useState<AuthView>("login");
  const [sessionEmail, setSessionEmail] = useState<string | null>(() =>
    localStorage.getItem("perf_session_email"),
  );
  const [sessionToken, setSessionToken] = useState<string | null>(() =>
    localStorage.getItem("perf_session_token"),
  );

  // App state
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Perfume | null>(null);
  const [showPostPurchase, setShowPostPurchase] = useState(false);

  // URL params
  const stripeSessionId =
    new URLSearchParams(window.location.search).get("session_id") ?? undefined;

  useEffect(() => {
    const tabParam = new URLSearchParams(window.location.search).get(
      "tab",
    ) as AppTab | null;
    if (tabParam && TABS.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey) {
        const tab = TABS.find((t) => t.key === e.key.toLowerCase());
        if (tab) {
          e.preventDefault();
          setActiveTab(tab.id);
          setViewingProduct(null);
        }
      }
      if (e.key === "Escape") {
        setSidePanelOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleLoginSuccess = (email: string, token: string) => {
    localStorage.setItem("perf_session_email", email);
    localStorage.setItem("perf_session_token", token);
    setSessionEmail(email);
    setSessionToken(token);
    const isFirstLogin = !localStorage.getItem("perf_welcomed");
    if (isFirstLogin) {
      localStorage.setItem("perf_welcomed", "1");
      setShowWelcome(true);
    }
  };

  const handleSignupSuccess = () => {
    // After signup, navigate to login to complete sign-in
    setAuthView("login");
  };

  const handleLogout = async () => {
    if (actor && sessionToken) {
      try {
        await actor.logoutSession(sessionToken);
      } catch {
        // ignore
      }
    }
    localStorage.removeItem("perf_session_email");
    localStorage.removeItem("perf_session_token");
    setSessionEmail(null);
    setSessionToken(null);
    setSidePanelOpen(false);
    setActiveTab("home");
  };

  const navigateTo = (tab: AppTab) => {
    setActiveTab(tab);
    setViewingProduct(null);
    setSidePanelOpen(false);
  };

  // ── Unauthenticated views ────────────────────────────────────────────────
  if (!sessionEmail || !sessionToken) {
    return (
      <div className="min-h-screen bg-background">
        <AnimatePresence mode="wait">
          {authView === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoginPage
                onNavigateToSignup={() => setAuthView("signup")}
                onLoginSuccess={handleLoginSuccess}
                onForgotPassword={() => setAuthView("forgot")}
              />
            </motion.div>
          )}
          {authView === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SignupPage
                onNavigateToLogin={() => setAuthView("login")}
                onSignupSuccess={handleSignupSuccess}
              />
            </motion.div>
          )}
          {authView === "forgot" && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ForgotPasswordPage onBack={() => setAuthView("login")} />
            </motion.div>
          )}
        </AnimatePresence>
        <Toaster />
      </div>
    );
  }

  // ── Authenticated app ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Welcome modal */}
      <AnimatePresence>
        {showWelcome && (
          <WelcomeModal
            onClose={() => setShowWelcome(false)}
            onGoToPartners={() => {
              setShowWelcome(false);
              navigateTo("partners");
            }}
          />
        )}
      </AnimatePresence>

      {/* Top header */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => setSidePanelOpen(true)}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          aria-label="Open menu"
          data-ocid="nav.open_modal_button"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>

        <div className="flex items-center gap-2">
          <img
            src="/assets/uploads/ChatGPT-Image-Mar-10-2026-12_13_57-PM-1.png"
            alt="Perf Store"
            className="w-7 h-7 rounded-full object-cover"
          />
          <span className="font-display text-lg font-bold text-foreground">
            Perf Store
          </span>
          <span className="text-gold text-[10px] font-body font-medium tracking-[0.2em] uppercase hidden sm:inline">
            by LEMA
          </span>
        </div>

        <div className="w-9" />
      </header>

      {/* Side panel */}
      <AnimatePresence>
        {sidePanelOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidePanelOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.aside
              key="panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-card border-r border-border flex flex-col shadow-2xl"
              data-ocid="nav.panel"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <img
                    src="/assets/uploads/ChatGPT-Image-Mar-10-2026-12_13_57-PM-1.png"
                    alt="Perf Store"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-display text-sm font-bold text-foreground">
                      Perf Store
                    </p>
                    <p className="font-body text-[10px] text-muted-foreground">
                      {sessionEmail}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSidePanelOpen(false)}
                  className="p-1 rounded hover:bg-secondary transition-colors"
                  data-ocid="nav.close_button"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Nav items */}
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {TABS.map((tab) => (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => navigateTo(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-gold/10 text-gold border border-gold/20"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                    data-ocid={`nav.${tab.id}.tab`}
                  >
                    <div className="flex items-center gap-3">
                      {tab.icon}
                      <span className="font-body text-sm font-medium">
                        {tab.label}
                      </span>
                    </div>
                    <span className="hidden md:inline text-[10px] font-mono text-muted-foreground/50 border border-border rounded px-1 py-0.5">
                      {tab.shortcut}
                    </span>
                  </button>
                ))}
              </nav>

              {/* Customer service */}
              <div className="px-5 py-4 border-t border-border space-y-2">
                <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
                  Customer Service
                </p>
                <a
                  href="mailto:Perfstore26@gmail.com"
                  className="flex items-center gap-2 text-xs font-body text-muted-foreground hover:text-gold transition-colors"
                  data-ocid="nav.link"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Perfstore26@gmail.com
                </a>
                <a
                  href="tel:0756633420"
                  className="flex items-center gap-2 text-xs font-body text-muted-foreground hover:text-gold transition-colors"
                  data-ocid="nav.link"
                >
                  <Phone className="w-3.5 h-3.5" />
                  0756 633 420
                </a>
              </div>

              {/* Logout */}
              <div className="px-4 pb-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors font-body text-sm"
                  data-ocid="nav.delete_button"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <AnimatePresence mode="wait">
          {viewingProduct ? (
            <motion.div
              key="product"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProductPage
                perfume={viewingProduct}
                onBack={() => setViewingProduct(null)}
              />
            </motion.div>
          ) : activeTab === "home" ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <HomePage
                onViewProduct={(p) => setViewingProduct(p)}
                onNavigateToPartner={() => navigateTo("partners")}
              />
            </motion.div>
          ) : activeTab === "stores" ? (
            <motion.div
              key="stores"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <StoresPage userEmail={sessionEmail} />
            </motion.div>
          ) : activeTab === "cart" ? (
            <motion.div
              key="cart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CartPage
                onOrderPlaced={() => {
                  setShowPostPurchase(true);
                  setActiveTab("orders");
                }}
                stripeSessionId={stripeSessionId}
              />
            </motion.div>
          ) : activeTab === "orders" ? (
            <motion.div
              key="orders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <OrdersPage />
            </motion.div>
          ) : activeTab === "partners" ? (
            <motion.div
              key="partners"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PartnerPage />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      {/* Bottom tab navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-sm border-t border-border flex">
        {TABS.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => navigateTo(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              activeTab === tab.id
                ? "text-gold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid={`nav.${tab.id}.tab`}
          >
            <span
              className={
                activeTab === tab.id ? "scale-110 transition-transform" : ""
              }
            >
              {tab.icon}
            </span>
            <span className="text-[10px] font-body font-medium">
              {tab.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Post-purchase prompt */}
      <AnimatePresence>
        {showPostPurchase && (
          <PostPurchasePrompt
            productNames={[]}
            onDismiss={() => setShowPostPurchase(false)}
          />
        )}
      </AnimatePresence>

      <Toaster />
    </div>
  );
}
