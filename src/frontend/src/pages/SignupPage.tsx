import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface SignupPageProps {
  onNavigateToLogin: () => void;
}

export function SignupPage({ onNavigateToLogin }: SignupPageProps) {
  const { login, isLoggingIn } = useInternetIdentity();
  const { actor } = useActor();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAccount = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    setIsCreating(true);
    try {
      if (actor) {
        const name = email.split("@")[0] ?? email;
        await actor.saveCallerUserProfile({ name });
      }
      // Also trigger II login so they're actually authenticated
      login();
      onNavigateToLogin();
    } catch {
      toast.error("Failed to create account");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/assets/generated/perf-hero-bg.dim_1200x800.jpg')`,
        }}
      />
      <div className="absolute inset-0 bg-background/80" />

      {/* Scent wisps */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {["x", "y", "z"].map((key, i) => (
          <div
            key={key}
            className="absolute rounded-full"
            style={{
              width: `${120 + i * 100}px`,
              height: `${120 + i * 100}px`,
              background:
                "radial-gradient(circle, oklch(0.65 0.18 65 / 0.3) 0%, transparent 70%)",
              right: `${5 + i * 20}%`,
              bottom: `${20 + i * 12}%`,
              animation: `scent-drift ${6 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.8}s`,
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
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="text-gold w-6 h-6" />
            <span className="text-gold text-sm font-body font-medium tracking-[0.3em] uppercase">
              Perf
            </span>
            <Sparkles className="text-gold w-6 h-6" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground leading-tight">
            Join Perf
          </h1>
          <p className="text-muted-foreground text-sm mt-2 font-body">
            Discover the world's finest fragrances
          </p>
        </div>

        {/* Form card */}
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-8 shadow-gold-lg">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label
                htmlFor="signup-email"
                className="text-muted-foreground text-xs font-body tracking-widest uppercase"
              >
                Email
              </Label>
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-gold focus-visible:border-gold"
                data-ocid="signup.input"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="signup-password"
                className="text-muted-foreground text-xs font-body tracking-widest uppercase"
              >
                Password
              </Label>
              <Input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-gold focus-visible:border-gold"
                data-ocid="signup.input"
              />
            </div>

            <Button
              onClick={handleCreateAccount}
              disabled={isCreating || isLoggingIn}
              className="w-full bg-gold text-primary-foreground hover:bg-gold-dim font-body font-semibold tracking-wide h-11"
              data-ocid="signup.primary_button"
            >
              {isCreating || isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
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
              onClick={onNavigateToLogin}
              className="w-full text-gold hover:text-gold hover:bg-secondary font-body"
              data-ocid="signup.link"
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
