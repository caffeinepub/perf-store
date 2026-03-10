import {
  BarChart3,
  Building2,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Package,
  Users,
} from "lucide-react";
import type { AdminPage } from "./AdminLayout";

interface Props {
  activePage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
}

const navItems: {
  id: AdminPage;
  label: string;
  Icon: typeof LayoutDashboard;
  ocid: string;
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    Icon: LayoutDashboard,
    ocid: "nav.dashboard_link",
  },
  {
    id: "partners",
    label: "Partner Submissions",
    Icon: Users,
    ocid: "nav.partners_link",
  },
  {
    id: "stores",
    label: "Store Submissions",
    Icon: Building2,
    ocid: "nav.stores_link",
  },
  {
    id: "products",
    label: "Product Submissions",
    Icon: Package,
    ocid: "nav.products_link",
  },
  {
    id: "earnings",
    label: "Earnings",
    Icon: BarChart3,
    ocid: "nav.earnings_link",
  },
];

export function AdminSidebar({ activePage, onNavigate, onLogout }: Props) {
  return (
    <aside className="w-64 shrink-0 bg-sidebar flex flex-col h-full border-r border-sidebar-border">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/perf-admin-logo-transparent.dim_48x48.png"
            alt="Perf Store"
            className="w-8 h-8 rounded-md"
          />
          <div>
            <p className="font-display text-sidebar-foreground text-sm font-bold tracking-widest uppercase">
              PERF STORE
            </p>
            <p className="text-[10px] font-body text-sidebar-foreground/40 tracking-wider uppercase">
              Admin Portal
            </p>
          </div>
        </div>
      </div>

      {/* LEMA branding strip */}
      <div className="px-5 py-3 border-b border-sidebar-border/30">
        <span className="font-mono text-[10px] text-gold/70 tracking-[0.3em] uppercase">
          by LEMA
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 py-1.5 text-[10px] font-body font-semibold text-sidebar-foreground/30 tracking-widest uppercase mb-1">
          Navigation
        </p>
        {navItems.map(({ id, label, Icon, ocid }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
              }`}
              data-ocid={ocid}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive
                    ? "text-gold"
                    : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70"
                }`}
              />
              <span className="font-body text-sm">{label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold" />
              )}
            </button>
          );
        })}

        {/* Live Store link */}
        <div className="pt-3 mt-3 border-t border-sidebar-border/30">
          <p className="px-3 py-1.5 text-[10px] font-body font-semibold text-sidebar-foreground/30 tracking-widest uppercase mb-1">
            Quick Links
          </p>
          <a
            href="https://perf-store-cdt.caffeine.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left text-sidebar-foreground/60 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group"
            data-ocid="nav.live_store_link"
          >
            <ExternalLink className="w-4 h-4 shrink-0 text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70" />
            <span className="font-body text-sm">Live Perf Store</span>
          </a>
        </div>
      </nav>

      {/* Bottom: logout */}
      <div className="px-3 pb-5 pt-3 border-t border-sidebar-border/30">
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left text-sidebar-foreground/50 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          data-ocid="nav.logout_button"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="font-body text-sm">Sign Out</span>
        </button>
        <div className="mt-4 px-3">
          <p className="font-body text-[10px] text-sidebar-foreground/25 leading-relaxed">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold/40 hover:text-gold/70 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </aside>
  );
}
