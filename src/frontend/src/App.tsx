import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import {
  Home,
  Loader2,
  LogOut,
  Menu,
  Phone,
  Receipt,
  ShoppingCart,
  Store,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Perfume } from "./backend.d";
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

const TOKEN_KEY = "perf_session_token";
const EMAIL_KEY = "perf_session_email";

type AuthView = "login" | "signup" | "forgotPassword";
type MainTab = "home" | "cart" | "orders" | "partner" | "stores";

export default function App() {
  const { actor, isFetching } = useActor();

  // Email auth state — initialised synchronously from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!localStorage.getItem(TOKEN_KEY),
  );
  const [sessionToken, setSessionToken] = useState<string>(
    () => localStorage.getItem(TOKEN_KEY) ?? "",
  );
  const [userEmail, setUserEmail] = useState<string>(
    () => localStorage.getItem(EMAIL_KEY) ?? "",
  );

  const [authView, setAuthView] = useState<AuthView>("login");
  const [activeTab, setActiveTab] = useState<MainTab>(() => {
    // Honour ?tab= param from PWA shortcuts on initial mount
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab") as MainTab | null;
    const valid: MainTab[] = ["home", "cart", "orders", "partner", "stores"];
    return tab && valid.includes(tab) ? tab : "home";
  });
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

  // Check for Stripe session return
  const [stripeSessionId] = useState<string | undefined>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("session_id") ?? undefined;
  });

  // Auto-switch to cart tab when returning from Stripe checkout
  useEffect(() => {
    if (stripeSessionId && isAuthenticated) {
      setActiveTab("cart");
    }
  }, [stripeSessionId, isAuthenticated]);

  // Keyboard shortcuts: Alt+H/C/O/P to jump tabs; Escape to close side panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case "h":
            e.preventDefault();
            setActiveTab("home");
            setSidePanelOpen(false);
            break;
          case "c":
            e.preventDefault();
            setActiveTab("cart");
            setSidePanelOpen(false);
            break;
          case "o":
            e.preventDefault();
            setActiveTab("orders");
            setSidePanelOpen(false);
            break;
          case "p":
            e.preventDefault();
            setActiveTab("partner");
            setSidePanelOpen(false);
            break;
          case "s":
            e.preventDefault();
            setActiveTab("stores");
            setSidePanelOpen(false);
            break;
        }
      }
      if (e.key === "Escape") {
        setSidePanelOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Called by LoginPage on successful login
  const handleLoginSuccess = (email: string, token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EMAIL_KEY, email);
    setSessionToken(token);
    setUserEmail(email);
    setIsAuthenticated(true);
  };

  // Sign out
  const handleLogout = async () => {
    setIsLoggingOut(true);
    if (actor && sessionToken) {
      try {
        await actor.logoutSession(sessionToken);
      } catch {
        // Ignore server errors — always clear local state
      }
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setSessionToken("");
    setUserEmail("");
    setIsAuthenticated(false);
    setIsLoggingOut(false);
  };

  // Brief loading state while actor is being created
  if (isFetching && !actor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-gold w-8 h-8 animate-spin mx-auto mb-3" />
          <p className="font-body text-muted-foreground text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  // Unauthenticated — show login / signup / forgot password
  if (!isAuthenticated) {
    return (
      <>
        <AnimatePresence mode="wait">
          {authView === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <LoginPage
                onNavigateToSignup={() => setAuthView("signup")}
                onLoginSuccess={handleLoginSuccess}
                onForgotPassword={() => setAuthView("forgotPassword")}
              />
            </motion.div>
          )}
          {authView === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <SignupPage
                onNavigateToLogin={() => setAuthView("login")}
                onSignupSuccess={() => setAuthView("login")}
              />
            </motion.div>
          )}
          {authView === "forgotPassword" && (
            <motion.div
              key="forgotPassword"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ForgotPasswordPage onBack={() => setAuthView("login")} />
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
  const tabs: {
    id: MainTab;
    label: string;
    Icon: typeof Home;
    shortcut: string;
  }[] = [
    { id: "home", label: "Home", Icon: Home, shortcut: "Alt+H" },
    { id: "stores", label: "Stores", Icon: Store, shortcut: "Alt+S" },
    { id: "cart", label: "Cart", Icon: ShoppingCart, shortcut: "Alt+C" },
    { id: "orders", label: "Orders", Icon: Receipt, shortcut: "Alt+O" },
    { id: "partner", label: "Partners", Icon: Users, shortcut: "Alt+P" },
  ];

  // First letter of email for avatar
  const userInitial = userEmail ? (userEmail[0]?.toUpperCase() ?? "U") : "U";

  const navigateTo = (tab: MainTab) => {
    setActiveTab(tab);
    setSidePanelOpen(false);
  };

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Side panel (Sheet from left) */}
        <Sheet open={sidePanelOpen} onOpenChange={setSidePanelOpen}>
          <SheetContent
            side="left"
            className="w-72 p-0 flex flex-col bg-card border-r border-border"
            data-ocid="nav.side_panel.panel"
          >
            {/* Panel header */}
            <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/40">
              <div className="flex items-center justify-between">
                <SheetTitle className="font-display text-gold text-xl tracking-[0.25em] uppercase">
                  Perf
                </SheetTitle>
                <button
                  type="button"
                  onClick={() => setSidePanelOpen(false)}
                  aria-label="Close navigation panel"
                  className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  data-ocid="nav.side_panel.close_button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* User info */}
              <div className="flex items-center gap-3 mt-3">
                <span className="w-9 h-9 rounded-full bg-gold/20 text-gold flex items-center justify-center text-sm font-body font-semibold shrink-0">
                  {userInitial}
                </span>
                <span className="text-sm font-body text-muted-foreground truncate max-w-[160px]">
                  {userEmail || "Guest"}
                </span>
              </div>
            </SheetHeader>

            {/* Navigation items */}
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
              {tabs.map(({ id, label, Icon, shortcut }) => {
                const isActive = activeTab === id;
                const ocidMap: Record<MainTab, string> = {
                  home: "nav.side_panel.home.button",
                  cart: "nav.side_panel.cart.button",
                  orders: "nav.side_panel.orders.button",
                  partner: "nav.side_panel.partner.button",
                  stores: "nav.side_panel.stores.button",
                };
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => navigateTo(id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold group ${
                      isActive
                        ? "bg-gold/10 text-gold"
                        : "text-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                    data-ocid={ocidMap[id]}
                  >
                    <span className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? "text-gold"
                            : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      />
                      <span className="font-body text-sm font-medium">
                        {label}
                      </span>
                    </span>
                    <Badge
                      variant="outline"
                      className="hidden md:inline-flex text-[10px] px-1.5 py-0.5 font-mono border-border/50 text-muted-foreground shrink-0"
                    >
                      {shortcut}
                    </Badge>
                  </button>
                );
              })}

              <Separator className="my-3 bg-border/40" />

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left text-destructive hover:bg-destructive/10 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive disabled:opacity-60 disabled:pointer-events-none"
                data-ocid="nav.side_panel.logout.button"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : (
                  <LogOut className="w-4 h-4 shrink-0" />
                )}
                <span className="font-body text-sm font-medium">
                  {isLoggingOut ? "Signing out…" : "Sign Out"}
                </span>
              </button>
            </nav>

            {/* Service contact at bottom */}
            <div className="px-5 py-4 border-t border-border/40 flex items-center gap-3">
              <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-body text-muted-foreground truncate">
                  Adrian Were
                </p>
                <a
                  href="tel:0706130805"
                  className="text-xs font-mono text-gold hover:text-gold/80 transition-colors"
                >
                  0706130805
                </a>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Top header with hamburger + user/logout control */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-2 bg-background/90 backdrop-blur-sm border-b border-border/40">
          {/* Left: hamburger menu */}
          <button
            type="button"
            onClick={() => setSidePanelOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={sidePanelOpen}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            data-ocid="nav.menu.button"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Centre: logo */}
          <span className="font-display text-gold text-base tracking-[0.25em] uppercase select-none absolute left-1/2 -translate-x-1/2">
            Perf
          </span>

          {/* Right: avatar + logout */}
          <div className="flex items-center gap-2">
            {userEmail && (
              <span className="hidden sm:block text-muted-foreground text-xs font-body truncate max-w-[140px]">
                {userEmail}
              </span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Sign out"
              aria-label="Sign out"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-border/60 bg-card/50 hover:bg-secondary hover:border-gold/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold group disabled:opacity-60 disabled:pointer-events-none"
              data-ocid="nav.logout.button"
            >
              {isLoggingOut ? (
                <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
              ) : (
                <>
                  <span className="w-5 h-5 rounded-full bg-gold/20 text-gold flex items-center justify-center text-[10px] font-body font-semibold leading-none">
                    {userInitial}
                  </span>
                  <LogOut className="w-3.5 h-3.5 text-muted-foreground group-hover:text-gold transition-colors" />
                </>
              )}
            </button>
          </div>
        </header>

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
                <CartPage
                  onOrderPlaced={() => setActiveTab("orders")}
                  stripeSessionId={stripeSessionId}
                />
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
            {activeTab === "stores" && (
              <motion.div
                key="stores"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <StoresPage userEmail={userEmail} />
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
