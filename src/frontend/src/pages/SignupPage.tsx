import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What city were you born in?",
  "What was the name of your primary school?",
  "What is your oldest sibling's middle name?",
];

interface SignupPageProps {
  onNavigateToLogin: () => void;
  onSignupSuccess: () => void;
}

export function SignupPage({
  onNavigateToLogin,
  onSignupSuccess,
}: SignupPageProps) {
  const { actor } = useActor();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreateAccount = async () => {
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg("Please enter your email");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg("Please enter a valid email address");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter a password");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }
    if (!securityQuestion) {
      setErrorMsg("Please select a security question");
      return;
    }
    if (!securityAnswer.trim()) {
      setErrorMsg("Please enter your security answer");
      return;
    }
    if (!actor) {
      setErrorMsg("Connection not ready. Please try again.");
      return;
    }

    setIsCreating(true);
    try {
      const result = await actor.registerWithEmail(
        email.trim(),
        password,
        securityQuestion,
        securityAnswer.trim(),
      );
      if (result.ok) {
        toast.success("Account created! Please sign in.");
        onSignupSuccess();
      } else {
        setErrorMsg(
          result.message || "Failed to create account. Please try again.",
        );
      }
    } catch {
      setErrorMsg("Failed to create account. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateAccount();
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
                onKeyDown={handleKeyDown}
                placeholder="your@email.com"
                autoComplete="email"
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
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                autoComplete="new-password"
                className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-gold focus-visible:border-gold"
                data-ocid="signup.input"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="signup-confirm-password"
                className="text-muted-foreground text-xs font-body tracking-widest uppercase"
              >
                Confirm Password
              </Label>
              <Input
                id="signup-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                autoComplete="new-password"
                className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-gold focus-visible:border-gold"
                data-ocid="signup.input"
              />
            </div>

            {/* Security question */}
            <div className="space-y-1.5">
              <Label
                htmlFor="signup-security-question"
                className="text-muted-foreground text-xs font-body tracking-widest uppercase"
              >
                Security Question
              </Label>
              <Select
                value={securityQuestion}
                onValueChange={setSecurityQuestion}
              >
                <SelectTrigger
                  id="signup-security-question"
                  className="bg-input/50 border-border text-foreground focus:ring-gold focus:border-gold font-body text-sm"
                  data-ocid="signup.select"
                >
                  <SelectValue placeholder="Select a security question" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {SECURITY_QUESTIONS.map((q) => (
                    <SelectItem
                      key={q}
                      value={q}
                      className="font-body text-sm focus:bg-secondary focus:text-foreground"
                    >
                      {q}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Security answer */}
            <div className="space-y-1.5">
              <Label
                htmlFor="signup-security-answer"
                className="text-muted-foreground text-xs font-body tracking-widest uppercase"
              >
                Security Answer
              </Label>
              <Input
                id="signup-security-answer"
                type="text"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Your answer"
                autoComplete="off"
                className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-gold focus-visible:border-gold"
                data-ocid="signup.input"
              />
            </div>

            {errorMsg && (
              <p
                className="text-destructive text-sm font-body"
                data-ocid="signup.error_state"
              >
                {errorMsg}
              </p>
            )}

            <Button
              onClick={handleCreateAccount}
              disabled={isCreating}
              className="w-full bg-gold text-primary-foreground hover:bg-gold-dim font-body font-semibold tracking-wide h-11"
              data-ocid="signup.primary_button"
            >
              {isCreating ? (
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

        <p className="text-center text-muted-foreground/60 text-xs mt-6 font-body">
          Secured by Perf
        </p>
      </motion.div>
    </div>
  );
}
