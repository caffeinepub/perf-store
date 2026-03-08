import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";

interface ForgotPasswordPageProps {
  onBack: () => void;
}

type Step = 1 | 2 | 3;

export function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const { actor } = useActor();

  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [email, setEmail] = useState("");
  const [step1Loading, setStep1Loading] = useState(false);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Step 2
  const [securityQuestion, setSecurityQuestion] = useState<string | null>(null);
  const [securityAnswer, setSecurityAnswer] = useState("");

  // Step 3
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [step3Loading, setStep3Loading] = useState(false);
  const [step3Error, setStep3Error] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // ── Step 1: Look up security question ──────────────────────────────────────
  const handleContinue = async () => {
    setStep1Error(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setStep1Error("Please enter your email address");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setStep1Error("Please enter a valid email address");
      return;
    }
    if (!actor) {
      setStep1Error("Connection not ready. Please try again.");
      return;
    }
    setStep1Loading(true);
    try {
      const question = await actor.getSecurityQuestion(trimmedEmail);
      if (!question) {
        setStep1Error("No account found with that email address");
        return;
      }
      setSecurityQuestion(question);
      setStep(2);
    } catch {
      setStep1Error("Something went wrong. Please try again.");
    } finally {
      setStep1Loading(false);
    }
  };

  // ── Step 2: Confirm answer, go to step 3 ───────────────────────────────────
  const handleNext = () => {
    if (!securityAnswer.trim()) return;
    setStep(3);
  };

  // ── Step 3: Reset password ─────────────────────────────────────────────────
  const handleResetPassword = async () => {
    setStep3Error(null);
    if (!newPassword) {
      setStep3Error("Please enter a new password");
      return;
    }
    if (newPassword.length < 8) {
      setStep3Error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setStep3Error("Passwords do not match");
      return;
    }
    if (!actor) {
      setStep3Error("Connection not ready. Please try again.");
      return;
    }
    setStep3Loading(true);
    try {
      const result = await actor.resetPasswordWithSecurityAnswer(
        email.trim(),
        securityAnswer.trim(),
        newPassword,
      );
      if (result.ok) {
        setResetSuccess(true);
      } else {
        setStep3Error(
          result.message ||
            "Incorrect security answer. Please go back and try again.",
        );
      }
    } catch {
      setStep3Error("Failed to reset password. Please try again.");
    } finally {
      setStep3Loading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") action();
  };

  const stepTitles: Record<Step, string> = {
    1: "Find Your Account",
    2: "Security Question",
    3: "Create New Password",
  };

  const stepSubtitles: Record<Step, string> = {
    1: "Enter your email to get started",
    2: "Answer your security question",
    3: "Choose a new secure password",
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
      <div className="absolute inset-0 bg-background/80" />

      {/* Scent wisps */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {["a", "b", "c"].map((key, i) => (
          <div
            key={key}
            className="absolute rounded-full"
            style={{
              width: `${140 + i * 90}px`,
              height: `${140 + i * 90}px`,
              background:
                "radial-gradient(circle, oklch(0.78 0.16 75 / 0.3) 0%, transparent 70%)",
              left: `${15 + i * 25}%`,
              top: `${25 + i * 18}%`,
              animation: `scent-drift ${5 + i * 1.5}s ease-in-out infinite`,
              animationDelay: `${i * 1.1}s`,
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
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="font-display text-3xl font-bold text-foreground leading-tight">
                {stepTitles[step]}
              </h1>
              <p className="text-muted-foreground text-sm mt-2 font-body">
                {stepSubtitles[step]}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {([1, 2, 3] as Step[]).map((s) => (
              <div
                key={s}
                className={`h-1 rounded-full transition-all duration-300 ${
                  s === step
                    ? "w-6 bg-gold"
                    : s < step
                      ? "w-3 bg-gold/50"
                      : "w-3 bg-border"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form card */}
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-8 shadow-gold-lg">
          <AnimatePresence mode="wait">
            {/* ── Step 1 ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <Label
                    htmlFor="forgot-email"
                    className="text-muted-foreground text-xs font-body tracking-widest uppercase"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, handleContinue)}
                    placeholder="your@email.com"
                    autoComplete="email"
                    className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-gold focus-visible:border-gold"
                    data-ocid="forgot.input"
                  />
                </div>

                {step1Error && (
                  <p
                    className="text-destructive text-sm font-body"
                    data-ocid="forgot.error_state"
                  >
                    {step1Error}
                  </p>
                )}

                <Button
                  onClick={handleContinue}
                  disabled={step1Loading}
                  className="w-full bg-gold text-primary-foreground hover:bg-gold-dim font-body font-semibold tracking-wide h-11"
                  data-ocid="forgot.primary_button"
                >
                  {step1Loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Looking up account…
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </motion.div>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {securityQuestion && (
                  <div className="p-3 rounded-md bg-secondary/60 border border-gold/20">
                    <p className="font-body text-xs text-muted-foreground tracking-widest uppercase mb-1.5">
                      Security Question
                    </p>
                    <p className="font-body text-sm text-foreground font-medium leading-relaxed">
                      {securityQuestion}
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label
                    htmlFor="forgot-answer"
                    className="text-muted-foreground text-xs font-body tracking-widest uppercase"
                  >
                    Your Answer
                  </Label>
                  <Input
                    id="forgot-answer"
                    type="text"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, handleNext)}
                    placeholder="Enter your answer"
                    autoComplete="off"
                    className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-gold focus-visible:border-gold"
                    data-ocid="forgot.input"
                  />
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!securityAnswer.trim()}
                  className="w-full bg-gold text-primary-foreground hover:bg-gold-dim font-body font-semibold tracking-wide h-11 disabled:opacity-50"
                  data-ocid="forgot.primary_button"
                >
                  Next
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="w-full text-muted-foreground hover:text-foreground hover:bg-secondary font-body"
                  data-ocid="forgot.secondary_button"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Back
                </Button>
              </motion.div>
            )}

            {/* ── Step 3 ── */}
            {step === 3 && !resetSuccess && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-950/30 border border-emerald-500/20">
                  <CheckCircle2 className="text-emerald-400 w-4 h-4 flex-shrink-0" />
                  <p className="font-body text-xs text-emerald-400">
                    Identity verified — enter your new password below
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="forgot-new-password"
                    className="text-muted-foreground text-xs font-body tracking-widest uppercase"
                  >
                    New Password
                  </Label>
                  <Input
                    id="forgot-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, handleResetPassword)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-gold focus-visible:border-gold"
                    data-ocid="forgot.input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="forgot-confirm-password"
                    className="text-muted-foreground text-xs font-body tracking-widest uppercase"
                  >
                    Confirm New Password
                  </Label>
                  <Input
                    id="forgot-confirm-password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, handleResetPassword)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-gold focus-visible:border-gold"
                    data-ocid="forgot.input"
                  />
                </div>

                {step3Error && (
                  <p
                    className="text-destructive text-sm font-body"
                    data-ocid="forgot.error_state"
                  >
                    {step3Error}
                  </p>
                )}

                <Button
                  onClick={handleResetPassword}
                  disabled={step3Loading}
                  className="w-full bg-gold text-primary-foreground hover:bg-gold-dim font-body font-semibold tracking-wide h-11"
                  data-ocid="forgot.primary_button"
                >
                  {step3Loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting password…
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setStep(2)}
                  className="w-full text-muted-foreground hover:text-foreground hover:bg-secondary font-body"
                  data-ocid="forgot.secondary_button"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Back
                </Button>
              </motion.div>
            )}

            {/* ── Success ── */}
            {step === 3 && resetSuccess && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-5 text-center"
              >
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="text-emerald-400 w-8 h-8" />
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-1">
                    Password Reset!
                  </h3>
                  <p className="font-body text-sm text-muted-foreground">
                    Your password has been updated successfully. You can now
                    sign in with your new password.
                  </p>
                </div>

                <Button
                  onClick={onBack}
                  className="w-full bg-gold text-primary-foreground hover:bg-gold-dim font-body font-semibold tracking-wide h-11"
                  data-ocid="forgot.primary_button"
                >
                  Back to Sign In
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Back link */}
        {!(step === 3 && resetSuccess) && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-1.5 w-full mt-4 text-muted-foreground/60 hover:text-muted-foreground text-xs font-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
            data-ocid="forgot.link"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Sign In
          </button>
        )}
      </motion.div>
    </div>
  );
}
