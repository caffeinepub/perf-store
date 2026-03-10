import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface Props {
  onLoginSuccess: () => void;
}

const ADMIN_EMAIL = "lennydave2004@gmail.com";
const ADMIN_PASSWORD = "@Lema2026";

export function LoginPage({ onLoginSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        onLoginSuccess();
      } else {
        setError("Invalid email or password. Please try again.");
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-sidebar px-12 py-10">
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/perf-admin-logo-transparent.dim_48x48.png"
            alt="Perf Store"
            className="w-10 h-10 rounded-lg"
          />
          <div>
            <p className="font-display text-sidebar-foreground text-lg font-bold tracking-widest uppercase">
              PERF STORE
            </p>
            <p className="text-xs font-body text-sidebar-foreground/50 tracking-wider uppercase">
              Admin Portal
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="space-y-3">
            <div className="w-12 h-1 rounded-full bg-gold" />
            <h1 className="font-display text-4xl text-sidebar-foreground leading-tight">
              Manage your
              <br />
              <span className="text-gold">marketplace</span>
              <br />
              with confidence.
            </h1>
          </div>
          <p className="font-body text-sm text-sidebar-foreground/60 leading-relaxed max-w-sm">
            Review partner applications, approve store listings, manage product
            submissions and track your earnings — all from one secure dashboard.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { label: "Partners", value: "3" },
              { label: "Stores", value: "2" },
              { label: "Products", value: "3" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-sidebar-accent/60 border border-sidebar-border/50 px-4 py-3"
              >
                <p className="font-display text-2xl text-gold font-bold">
                  {stat.value}
                </p>
                <p className="font-body text-xs text-sidebar-foreground/50 mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <p className="font-body text-xs text-sidebar-foreground/30">
          © {new Date().getFullYear()} LEMA — Perf Store Admin Portal
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm space-y-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <img
              src="/assets/generated/perf-admin-logo-transparent.dim_48x48.png"
              alt="Perf Store"
              className="w-8 h-8 rounded-lg"
            />
            <div>
              <p className="font-display text-foreground text-base font-bold tracking-widest uppercase">
                PERF STORE
              </p>
              <p className="text-xs font-body text-muted-foreground tracking-wider uppercase">
                Admin Portal
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-display text-2xl text-foreground font-bold">
              Welcome back
            </h2>
            <p className="font-body text-sm text-muted-foreground">
              Sign in to access the admin dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="font-body text-sm font-medium text-foreground"
              >
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Your admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="font-body h-11"
                data-ocid="login.input"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="font-body text-sm font-medium text-foreground"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="font-body h-11"
                data-ocid="login.password_input"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3"
                data-ocid="login.error_state"
              >
                <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                <p className="font-body text-sm text-destructive">{error}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-body font-semibold text-sm tracking-wide"
              data-ocid="login.submit_button"
            >
              {isLoading ? "Signing in…" : "Sign in to Admin"}
            </Button>
          </form>

          <p className="font-body text-xs text-muted-foreground text-center">
            Restricted access — authorised personnel only
          </p>
        </motion.div>
      </div>
    </div>
  );
}
