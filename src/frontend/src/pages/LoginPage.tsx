import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";

interface LoginPageProps {
  onNavigateToSignup: () => void;
  onLoginSuccess: (email: string, token: string) => void;
  onForgotPassword: () => void;
}

export function LoginPage({
  onNavigateToSignup,
  onLoginSuccess,
  onForgotPassword,
}: LoginPageProps) {
  const { actor } = useActor();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email.trim()) {
      setErrorMsg("Please enter your email");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password");
      return;
    }
    if (!actor) {
      setErrorMsg("Connection not ready. Please try again.");
      return;
    }
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const result = await actor.loginWithEmail(email.trim(), password);
      if (result.ok) {
        onLoginSuccess(email.trim(), result.token);
      } else {
        setErrorMsg(result.message || "Invalid email or password");
      }
    } catch {
      setErrorMsg("Login failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSignIn();
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/assets/generated/perf-hero-bg.dim_1200x800.jpg')`,
        }}
      />
      <div className="absolute inset-0 bg-background/75" />

      {/* Animated scent wisps */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {["a", "b", "c", "d"].map((key, i) => (
          <div
            key={key}
            className="absolute rounded-full opacity-20"
            style={{
              width: `${160 + i * 80}px`,
              height: `${160 + i * 80}px`,
              background:
                "radial-gradient(circle, oklch(0.78 0.16 75 / 0.4) 0%, transparent 70%)",
              left: `${10 + i * 22}%`,
              top: `${20 + i * 15}%`,
              animation: `scent-drift ${5 + i * 1.5}s ease-in-out infinite`,
              animationDelay: `${i * 1.2}s`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="text-gold w-6 h-6" />
            <span className="text-gold text-sm font-body font-medium tracking-[0.3em] uppercase">
              Perf
            </span>
            <Sparkles className="text-gold w-6 h-6" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground leading-tight">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-sm mt-2 font-body">
            Your luxury fragrance awaits
          </p>
        </div>

        {/* Form card */}
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-8 shadow-gold-lg">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label
                htmlFor="login-email"
                className="text-muted-foreground text-xs font-body tracking-widest uppercase"
              >
                Email
              </Label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="your@email.com"
                autoComplete="email"
                className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-gold focus-visible:border-gold"
                data-ocid="login.input"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="login-password"
                className="text-muted-foreground text-xs font-body tracking-widest uppercase"
              >
                Password
              </Label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                autoComplete="current-password"
                className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-gold focus-visible:border-gold"
                data-ocid="login.input"
              />
            </div>

            {/* Forgot password */}
            <div className="flex justify-end -mt-2">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-xs font-body text-muted-foreground hover:text-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
                data-ocid="login.link"
              >
                Forgot password?
              </button>
            </div>

            {errorMsg && (
              <p
                className="text-destructive text-sm font-body"
                data-ocid="login.error_state"
              >
                {errorMsg}
              </p>
            )}

            <Button
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="w-full bg-gold text-primary-foreground hover:bg-gold-dim font-body font-semibold tracking-wide h-11"
              data-ocid="login.primary_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-body tracking-widest">
                  or
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={onNavigateToSignup}
              className="w-full text-gold hover:text-gold hover:bg-secondary font-body"
              data-ocid="login.link"
            >
              Create an account
            </Button>
          </div>
        </div>

        <p className="text-center text-muted-foreground/60 text-xs mt-6 font-body">
          Secured by Perf
        </p>
      </motion.div>
    </div>
  );
}
