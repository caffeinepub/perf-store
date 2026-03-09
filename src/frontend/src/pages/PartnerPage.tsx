import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  ArrowDownToLine,
  Camera,
  CheckCircle,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  Edit2,
  KeyRound,
  Link,
  Loader2,
  LogOut,
  Package,
  PackagePlus,
  Percent,
  Phone,
  RefreshCw,
  Shield,
  Sparkles,
  TrendingUp,
  Upload,
  UserCog,
  Users,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAdminResetPassword,
  useAllRefundRequests,
  useAllUserEmails,
  useCommissionRate,
  useIsAdmin,
  usePartnerProducts,
  usePartnerStats,
  usePayoutAccount,
  usePayoutHistory,
  useSavePayoutAccount,
  useSubmitPartnerProduct,
  useUpdateRefundStatus,
} from "../hooks/useQueries";

type SubmissionStatus = "pending" | "approved" | "rejected";

const statusConfig: Record<
  SubmissionStatus,
  { label: string; icon: typeof Clock; className: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-secondary text-gold border-gold/30",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    className: "bg-emerald-950/50 text-emerald-400 border-emerald-500/30",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
};

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  const date = new Date(ms);
  if (date.getFullYear() < 2020) {
    return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function maskAccountId(accountId: string): string {
  if (accountId.length <= 8) return accountId;
  const prefix = accountId.slice(0, 8);
  const last4 = accountId.slice(-4);
  return `${prefix}...${last4}`;
}

function shortenPrincipal(
  principal: { toString: () => string } | string,
): string {
  const str = typeof principal === "string" ? principal : principal.toString();
  if (str.length <= 12) return str;
  return `${str.slice(0, 6)}…${str.slice(-4)}`;
}

export function PartnerPage() {
  const { data: stats, isLoading: statsLoading } = usePartnerStats();
  const { data: payoutAccount, isLoading: payoutAccountLoading } =
    usePayoutAccount();
  const { data: payoutHistory, isLoading: payoutHistoryLoading } =
    usePayoutHistory();
  const { data: commissionRate, isLoading: commissionLoading } =
    useCommissionRate();
  const { data: partnerProducts, isLoading: productsLoading } =
    usePartnerProducts();
  const { data: isAdmin } = useIsAdmin();
  const { data: allRefundRequests, isLoading: refundsLoading } =
    useAllRefundRequests();
  const { data: allUserEmails, isLoading: usersLoading } = useAllUserEmails();

  const savePayoutAccount = useSavePayoutAccount();
  const submitProduct = useSubmitPartnerProduct();
  const updateRefundStatus = useUpdateRefundStatus();
  const adminResetPassword = useAdminResetPassword();
  const { clear } = useInternetIdentity();

  const [copied, setCopied] = useState(false);
  const [showPartnerWelcome, setShowPartnerWelcome] = useState(true);

  // Payout account form
  const [connectAccountId, setConnectAccountId] = useState("");
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [payoutMethodType, setPayoutMethodType] = useState<
    "stripe" | "mobile_money"
  >("stripe");
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState("");
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState<
    "mpesa" | "airtel" | "tkash"
  >("mpesa");

  // Admin reset password form
  const [resetTargetEmail, setResetTargetEmail] = useState<string | null>(null);
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");

  // Product submission form
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productImageUrl, setProductImageUrl] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productCategory, setProductCategory] = useState("");

  // Image input state
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">(
    "upload",
  );
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const isLoading = statsLoading || commissionLoading;

  const commissionRateNum = commissionRate ? Number(commissionRate) : 15;
  const partnerShareNum = 100 - commissionRateNum;

  const referralLink = stats
    ? `perf.app/ref/${stats.referralCode}`
    : "perf.app/ref/...";

  const copyReferralLink = () => {
    navigator.clipboard
      .writeText(`https://${referralLink}`)
      .then(() => {
        setCopied(true);
        toast.success("Referral link copied!");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error("Failed to copy"));
  };

  const handleLogout = () => {
    clear();
    toast.success("Signed out successfully");
  };

  const handleSavePayoutAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payoutMethodType === "mobile_money") {
      const num = mobileMoneyNumber.trim().replace(/\s/g, "");
      const kenyanPhone = /^(07|01|\+2547|\+2541)\d{8,9}$/.test(num);
      if (!kenyanPhone) {
        toast.error(
          "Please enter a valid Kenyan phone number (e.g. 0712345678)",
        );
        return;
      }
      const normalized = num.startsWith("+254") ? `0${num.slice(4)}` : num;
      const prefixed = `${mobileMoneyProvider}:${normalized}`;
      try {
        await savePayoutAccount.mutateAsync(prefixed);
        toast.success("Mobile money payout method saved!");
        setMobileMoneyNumber("");
        setIsEditingAccount(false);
      } catch {
        toast.error("Failed to save payout method. Please try again.");
      }
    } else {
      const trimmed = connectAccountId.trim();
      if (!trimmed) {
        toast.error("Please enter a valid Stripe Connect Account ID");
        return;
      }
      if (!trimmed.startsWith("acct_")) {
        toast.error('Account ID must start with "acct_"');
        return;
      }
      try {
        await savePayoutAccount.mutateAsync(trimmed);
        toast.success("Payout account connected successfully!");
        setConnectAccountId("");
        setIsEditingAccount(false);
      } catch {
        toast.error("Failed to save payout account. Please try again.");
      }
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !productName.trim() ||
      !productPrice ||
      !productDescription.trim() ||
      !productCategory.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const price = Number.parseFloat(productPrice);
    if (Number.isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    let imageUrl = "";

    if (imageInputMode === "upload" && productImageFile) {
      // Read file as data URL
      imageUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(productImageFile);
      });
    } else if (imageInputMode === "url") {
      imageUrl = productImageUrl.trim();
    }

    try {
      // Convert dollars to cents and then to bigint
      const priceInCents = BigInt(Math.round(price * 100));
      await submitProduct.mutateAsync({
        name: productName.trim(),
        imageUrl,
        price: priceInCents,
        description: productDescription.trim(),
        category: productCategory.trim(),
      });

      // Reset form
      setProductName("");
      setProductPrice("");
      setProductImageUrl("");
      setProductDescription("");
      setProductCategory("");
      setProductImageFile(null);
      setProductImagePreview("");
      setImageInputMode("upload");

      toast.success(
        "Product submitted! It will appear in the store once approved.",
      );
    } catch {
      toast.error("Failed to submit product. Please try again.");
    }
  };

  const statCards = [
    {
      icon: TrendingUp,
      label: "Total Sales",
      value: stats
        ? `$${(Number(stats.totalSales) / 100).toFixed(2)}`
        : "$0.00",
      description: "Lifetime revenue",
      ocid: "partner.card.1",
    },
    {
      icon: Percent,
      label: "Commission Earned",
      value: stats
        ? `$${(Number(stats.commission) / 100).toFixed(2)}`
        : "$0.00",
      description: `${partnerShareNum}% of each sale`,
      ocid: "partner.card.2",
    },
    {
      icon: Wallet,
      label: "Pending Payout",
      value: stats
        ? `$${(Number(stats.pendingPayout) / 100).toFixed(2)}`
        : "$0.00",
      description: "Awaiting transfer",
      ocid: "partner.card.3",
    },
  ];

  const isPayoutConnected = !!payoutAccount && !isEditingAccount;

  // Detect payout method type when account loads
  if (payoutAccount && !isEditingAccount) {
    const isMobileMoney =
      payoutAccount.startsWith("mpesa:") ||
      payoutAccount.startsWith("airtel:") ||
      payoutAccount.startsWith("tkash:");
    if (isMobileMoney && payoutMethodType === "stripe") {
      const provider = payoutAccount.split(":")[0] as
        | "mpesa"
        | "airtel"
        | "tkash";
      setPayoutMethodType("mobile_money");
      setMobileMoneyProvider(provider);
    } else if (!isMobileMoney && payoutMethodType === "mobile_money") {
      setPayoutMethodType("stripe");
    }
  }

  return (
    <div className="min-h-full bg-background" data-ocid="partner.page">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center gap-2">
            <Users className="text-gold w-5 h-5" />
            <h1 className="font-display text-xl font-bold text-foreground">
              Partner
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="ml-auto text-muted-foreground hover:text-destructive font-body text-xs"
              data-ocid="partner.button"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Sign Out
            </Button>
          </div>
          <p className="text-muted-foreground text-xs font-body mt-0.5 tracking-widest uppercase">
            Partner Dashboard
          </p>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4 pb-24">
        {/* Partner welcome banner — shown only when no products submitted yet */}
        <AnimatePresence>
          {showPartnerWelcome &&
            !productsLoading &&
            (!partnerProducts || partnerProducts.length === 0) && (
              <motion.div
                key="partner-welcome"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12, scale: 0.97 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative rounded-xl border border-gold/30 bg-gradient-to-br from-gold/10 via-gold/5 to-transparent overflow-hidden"
                data-ocid="partner.welcome.card"
              >
                {/* Subtle top glow */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

                <div className="px-5 py-5 pr-12">
                  {/* Heading */}
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-gold flex-shrink-0" />
                    <h2 className="font-display text-lg font-bold text-gold tracking-tight">
                      Welcome, Partner!
                    </h2>
                  </div>

                  {/* Body */}
                  <p className="font-body text-sm text-foreground/80 leading-relaxed mb-3">
                    You're joining a growing community of sellers on{" "}
                    <span className="text-gold font-semibold">
                      LEMA Perf Store
                    </span>
                    . List your first product below and start earning your share
                    of every sale.{" "}
                    <span className="text-gold font-semibold">
                      The first three partners to sell enjoy a 90% cashback on
                      their first sale
                    </span>{" "}
                    — that means you keep almost everything!
                  </p>

                  {/* Info line */}
                  <div className="flex items-center gap-2 mt-2">
                    <Phone className="w-3.5 h-3.5 text-gold/70 flex-shrink-0" />
                    <p className="font-body text-xs text-muted-foreground">
                      Need help getting started? Call{" "}
                      <span className="text-foreground font-medium">
                        Adrian Were
                      </span>{" "}
                      on{" "}
                      <a
                        href="tel:0706130805"
                        className="text-gold hover:text-gold/80 transition-colors font-mono"
                      >
                        0706130805
                      </a>
                    </p>
                  </div>
                </div>

                {/* Dismiss button */}
                <button
                  type="button"
                  onClick={() => setShowPartnerWelcome(false)}
                  aria-label="Dismiss welcome banner"
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-secondary/60 hover:bg-secondary border border-border/60 hover:border-gold/30 flex items-center justify-center text-muted-foreground hover:text-gold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  data-ocid="partner.welcome.close_button"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
        </AnimatePresence>

        {isLoading ? (
          <div className="space-y-4" data-ocid="partner.loading_state">
            {["p1", "p2", "p3"].map((key) => (
              <div
                key={key}
                className="bg-card border border-border rounded-lg p-5"
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="w-10 h-10 rounded-md bg-muted" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3 bg-muted" />
                    <Skeleton className="h-6 w-1/2 bg-muted" />
                    <Skeleton className="h-3 w-2/3 bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Stats cards */}
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.ocid}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-lg p-5 hover:border-gold/30 transition-colors"
                  data-ocid={card.ocid}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                      <Icon className="text-gold w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-body text-xs text-muted-foreground tracking-widest uppercase mb-1">
                        {card.label}
                      </p>
                      <p className="font-display text-2xl font-bold text-foreground">
                        {card.value}
                      </p>
                      <p className="font-body text-xs text-muted-foreground/70 mt-1">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* ── PAYOUT ACCOUNT ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card
                className="bg-card border-border overflow-hidden"
                data-ocid="partner.panel"
              >
                {/* Trust strip */}
                <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                <CardHeader className="pb-3 pt-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Shield className="text-emerald-400 w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="font-display text-base font-bold text-foreground">
                        Payout Method
                      </CardTitle>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">
                        Receive your share automatically on each sale
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {payoutAccountLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full bg-muted" />
                      <Skeleton className="h-4 w-3/4 bg-muted" />
                    </div>
                  ) : isPayoutConnected && payoutAccount ? (
                    /* Connected state */
                    (() => {
                      const isMobileMoney =
                        payoutAccount.startsWith("mpesa:") ||
                        payoutAccount.startsWith("airtel:") ||
                        payoutAccount.startsWith("tkash:");
                      const providerLabels: Record<string, string> = {
                        mpesa: "M-Pesa",
                        airtel: "Airtel Money",
                        tkash: "T-Kash",
                      };
                      let displayValue = maskAccountId(payoutAccount);
                      let methodLabel = "Stripe Connect";
                      let methodIcon = (
                        <Shield className="w-4 h-4 text-emerald-400" />
                      );
                      if (isMobileMoney) {
                        const [prov, num] = payoutAccount.split(":");
                        const masked = num ? `***${num.slice(-6)}` : "***";
                        displayValue = `${providerLabels[prov] || prov} · ${masked}`;
                        methodLabel = "Mobile Money";
                        methodIcon = (
                          <Phone className="w-4 h-4 text-emerald-400" />
                        );
                      }
                      return (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
                            {methodIcon}
                            <div className="flex-1 min-w-0">
                              <p className="font-body text-xs text-emerald-400 font-semibold tracking-wide uppercase mb-0.5">
                                {methodLabel}
                              </p>
                              <p className="font-body text-sm text-foreground font-medium truncate">
                                {displayValue}
                              </p>
                            </div>
                            <Badge className="bg-emerald-950/50 text-emerald-400 border-emerald-500/30 font-body text-[10px] flex-shrink-0">
                              Active
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsEditingAccount(true);
                              if (isMobileMoney) {
                                setPayoutMethodType("mobile_money");
                                const [prov, num] = payoutAccount.split(":");
                                setMobileMoneyProvider(
                                  (prov as "mpesa" | "airtel" | "tkash") ||
                                    "mpesa",
                                );
                                setMobileMoneyNumber(num || "");
                              } else {
                                setPayoutMethodType("stripe");
                                setConnectAccountId(payoutAccount);
                              }
                            }}
                            className="border-border text-muted-foreground hover:text-foreground font-body text-xs"
                            data-ocid="partner.edit_button"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                            Change Account
                          </Button>
                          <p className="font-body text-[11px] text-muted-foreground/60 leading-relaxed">
                            Your share ({partnerShareNum}%) is transferred
                            within 2 business days of each sale.
                          </p>
                        </div>
                      );
                    })()
                  ) : (
                    /* Connect form */
                    <form
                      onSubmit={handleSavePayoutAccount}
                      className="space-y-4"
                    >
                      {/* Payout method selector */}
                      <div className="flex gap-2 p-1 bg-secondary/50 rounded-lg border border-border/50">
                        <button
                          type="button"
                          onClick={() => setPayoutMethodType("stripe")}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-body font-medium transition-all ${payoutMethodType === "stripe" ? "bg-background text-foreground shadow-sm border border-border/80" : "text-muted-foreground hover:text-foreground"}`}
                          data-ocid="partner.tab"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          Stripe
                        </button>
                        <button
                          type="button"
                          onClick={() => setPayoutMethodType("mobile_money")}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-body font-medium transition-all ${payoutMethodType === "mobile_money" ? "bg-background text-foreground shadow-sm border border-border/80" : "text-muted-foreground hover:text-foreground"}`}
                          data-ocid="partner.tab"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Mobile Money
                        </button>
                      </div>

                      {payoutMethodType === "stripe" ? (
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="connect-account-id"
                            className="font-body text-xs text-muted-foreground tracking-widest uppercase"
                          >
                            Stripe Connect Account ID
                          </Label>
                          <Input
                            id="connect-account-id"
                            placeholder="acct_1234567890"
                            value={connectAccountId}
                            onChange={(e) =>
                              setConnectAccountId(e.target.value)
                            }
                            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 font-body text-sm focus:border-gold/60"
                            data-ocid="partner.input"
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <Label className="font-body text-xs text-muted-foreground tracking-widest uppercase">
                              Provider
                            </Label>
                            <div className="flex gap-2">
                              {(["mpesa", "airtel", "tkash"] as const).map(
                                (p) => (
                                  <button
                                    key={p}
                                    type="button"
                                    onClick={() => setMobileMoneyProvider(p)}
                                    className={`flex-1 py-2 rounded-md text-xs font-body font-medium border transition-all ${mobileMoneyProvider === p ? "bg-gold/10 text-gold border-gold/40" : "bg-secondary border-border text-muted-foreground hover:text-foreground"}`}
                                    data-ocid="partner.toggle"
                                  >
                                    {p === "mpesa"
                                      ? "M-Pesa"
                                      : p === "airtel"
                                        ? "Airtel"
                                        : "T-Kash"}
                                  </button>
                                ),
                              )}
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="mobile-money-number"
                              className="font-body text-xs text-muted-foreground tracking-widest uppercase"
                            >
                              Phone Number
                            </Label>
                            <Input
                              id="mobile-money-number"
                              type="tel"
                              placeholder="0712 345 678"
                              value={mobileMoneyNumber}
                              onChange={(e) =>
                                setMobileMoneyNumber(e.target.value)
                              }
                              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 font-body text-sm focus:border-gold/60"
                              data-ocid="partner.input"
                            />
                          </div>
                        </div>
                      )}

                      <p className="font-body text-[11px] text-muted-foreground/70 leading-relaxed bg-secondary/40 rounded-md p-3 border border-border/50">
                        <span className="text-gold font-medium">
                          How it works:{" "}
                        </span>
                        {payoutMethodType === "stripe"
                          ? `Connect your Stripe account to receive automatic payouts when your products sell. Your share (${partnerShareNum}%) is transferred within 2 business days of each sale. The platform retains ${commissionRateNum}% as a service fee.`
                          : `Receive payouts directly to your mobile money account. Your share (${partnerShareNum}%) is sent within 2 business days of each sale.`}
                      </p>

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={savePayoutAccount.isPending}
                          className="flex-1 bg-gold text-primary-foreground hover:bg-gold-deep font-body text-sm tracking-wide font-medium"
                          data-ocid="partner.save_button"
                        >
                          {savePayoutAccount.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving…
                            </>
                          ) : (
                            <>
                              {payoutMethodType === "stripe" ? (
                                <Shield className="w-4 h-4 mr-2" />
                              ) : (
                                <Phone className="w-4 h-4 mr-2" />
                              )}
                              {payoutMethodType === "stripe"
                                ? "Connect Account"
                                : "Save Mobile Money"}
                            </>
                          )}
                        </Button>
                        {isEditingAccount && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsEditingAccount(false);
                              setConnectAccountId("");
                              setMobileMoneyNumber("");
                            }}
                            className="border-border text-muted-foreground hover:text-foreground font-body text-sm"
                            data-ocid="partner.cancel_button"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Referral link card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
              className="bg-card border border-border rounded-lg p-5 hover:border-gold/30 transition-colors"
              data-ocid="partner.card.4"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                  <Link className="text-gold w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-xs text-muted-foreground tracking-widest uppercase mb-1">
                    Referral Link
                  </p>
                  <p className="font-body text-sm text-foreground font-medium truncate mb-3">
                    {referralLink}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyReferralLink}
                    className="border-gold/40 text-gold hover:bg-gold hover:text-primary-foreground font-body text-xs"
                    data-ocid="partner.secondary_button"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Commission explanation */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48 }}
              className="bg-secondary/50 border border-border rounded-lg p-4"
            >
              <p className="font-body text-xs text-muted-foreground leading-relaxed">
                <span className="text-gold font-medium">Partner program: </span>
                {commissionLoading ? (
                  <span className="inline-block w-24 h-3 bg-muted rounded animate-pulse" />
                ) : (
                  <>
                    You earn{" "}
                    <span className="text-foreground font-semibold">
                      {partnerShareNum}%
                    </span>{" "}
                    of each sale. The platform takes{" "}
                    <span className="text-foreground font-semibold">
                      {commissionRateNum}%
                    </span>
                    . Share your referral link to start earning today. Payouts
                    are automatic once you connect your account.
                  </>
                )}
              </p>
            </motion.div>

            {/* ── LIST YOUR PRODUCT ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52 }}
            >
              <Card className="bg-card border-border" data-ocid="partner.panel">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                      <PackagePlus className="text-gold w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="font-display text-base font-bold text-foreground">
                        List Your Product
                      </CardTitle>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">
                        Submit your goods for review — approved items appear in
                        the store
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    {/* Product Name */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="product-name"
                        className="font-body text-xs text-muted-foreground tracking-widest uppercase"
                      >
                        Product Name *
                      </Label>
                      <Input
                        id="product-name"
                        placeholder="e.g. Oud Royale Parfum"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 font-body text-sm focus:border-gold/60"
                        data-ocid="partner.input"
                      />
                    </div>

                    {/* Price + Category row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="product-price"
                          className="font-body text-xs text-muted-foreground tracking-widest uppercase"
                        >
                          Price ($) *
                        </Label>
                        <Input
                          id="product-price"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={productPrice}
                          onChange={(e) => setProductPrice(e.target.value)}
                          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 font-body text-sm focus:border-gold/60"
                          data-ocid="partner.input"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="product-category"
                          className="font-body text-xs text-muted-foreground tracking-widest uppercase"
                        >
                          Category *
                        </Label>
                        <Input
                          id="product-category"
                          placeholder="e.g. Fragrance"
                          value={productCategory}
                          onChange={(e) => setProductCategory(e.target.value)}
                          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 font-body text-sm focus:border-gold/60"
                          data-ocid="partner.input"
                        />
                      </div>
                    </div>

                    {/* Product Image */}
                    <div className="space-y-2">
                      <Label className="font-body text-xs text-muted-foreground tracking-widest uppercase">
                        Product Image
                      </Label>

                      {/* Mode toggle */}
                      <div className="flex gap-1 p-1 bg-secondary rounded-lg w-fit">
                        <button
                          type="button"
                          onClick={() => setImageInputMode("upload")}
                          className={`px-3 py-1.5 rounded-md font-body text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                            imageInputMode === "upload"
                              ? "bg-gold text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Upload / Camera
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageInputMode("url")}
                          className={`px-3 py-1.5 rounded-md font-body text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                            imageInputMode === "url"
                              ? "bg-gold text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Enter URL
                        </button>
                      </div>

                      {imageInputMode === "upload" ? (
                        <div className="space-y-2">
                          {/* Hidden file inputs */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setProductImageFile(file);
                                setProductImagePreview(
                                  URL.createObjectURL(file),
                                );
                              }
                              e.target.value = "";
                            }}
                          />
                          <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/jpeg,image/png"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setProductImageFile(file);
                                setProductImagePreview(
                                  URL.createObjectURL(file),
                                );
                              }
                              e.target.value = "";
                            }}
                          />

                          {productImageFile ? (
                            /* Preview */
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/60 border border-border/60">
                              <img
                                src={productImagePreview}
                                alt="Product preview"
                                className="w-20 h-20 rounded-md object-cover flex-shrink-0 border border-border/40"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-body text-xs text-foreground font-medium truncate">
                                  {productImageFile.name}
                                </p>
                                <p className="font-body text-[11px] text-muted-foreground mt-0.5">
                                  {(productImageFile.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setProductImageFile(null);
                                  if (productImagePreview) {
                                    URL.revokeObjectURL(productImagePreview);
                                  }
                                  setProductImagePreview("");
                                }}
                                className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive/20 hover:bg-destructive/40 text-destructive flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                                aria-label="Remove image"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            /* Drop zone */
                            <div
                              className="border-2 border-dashed border-border/60 hover:border-gold/40 rounded-lg p-5 flex flex-col items-center gap-3 transition-colors duration-150"
                              data-ocid="partner.dropzone"
                            >
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center gap-3 w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md"
                                data-ocid="partner.upload_button"
                              >
                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                  <Upload className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div className="text-center">
                                  <p className="font-body text-sm text-foreground font-medium">
                                    Tap to choose a JPG or PNG
                                  </p>
                                  <p className="font-body text-[11px] text-muted-foreground mt-0.5">
                                    Max file size: unlimited
                                  </p>
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={() => cameraInputRef.current?.click()}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary border border-border/60 hover:border-gold/40 font-body text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                Take a Photo
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* URL mode */
                        <Input
                          id="product-image"
                          placeholder="https://example.com/image.jpg"
                          value={productImageUrl}
                          onChange={(e) => setProductImageUrl(e.target.value)}
                          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 font-body text-sm focus:border-gold/60"
                          data-ocid="partner.input"
                        />
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="product-description"
                        className="font-body text-xs text-muted-foreground tracking-widest uppercase"
                      >
                        Description *
                      </Label>
                      <Textarea
                        id="product-description"
                        placeholder="Describe your product — notes, ingredients, size, etc."
                        rows={3}
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 font-body text-sm focus:border-gold/60 resize-none"
                        data-ocid="partner.textarea"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submitProduct.isPending}
                      className="w-full bg-gold text-primary-foreground hover:bg-gold-deep font-body text-sm tracking-wide font-medium transition-all duration-200 disabled:opacity-60"
                      data-ocid="partner.submit_button"
                    >
                      {submitProduct.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting…
                        </>
                      ) : (
                        <>
                          <PackagePlus className="w-4 h-4 mr-2" />
                          Submit for Review
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* ── SUBMITTED PRODUCTS LIST (from backend) ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.56 }}
            >
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                      <Package className="text-gold w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="font-display text-base font-bold text-foreground">
                        Your Submissions
                      </CardTitle>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">
                        {productsLoading
                          ? "Loading…"
                          : `${partnerProducts?.length ?? 0} product${(partnerProducts?.length ?? 0) !== 1 ? "s" : ""} submitted`}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {productsLoading ? (
                    <div
                      className="space-y-2"
                      data-ocid="partner.loading_state"
                    >
                      {["s1", "s2"].map((k) => (
                        <div
                          key={k}
                          className="flex gap-3 p-3 rounded-md bg-secondary/40 border border-border/50"
                        >
                          <Skeleton className="w-12 h-12 rounded bg-muted flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/2 bg-muted" />
                            <Skeleton className="h-3 w-1/3 bg-muted" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !partnerProducts || partnerProducts.length === 0 ? (
                    <div
                      className="text-center py-6"
                      data-ocid="partner.empty_state"
                    >
                      <Package className="text-muted-foreground w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="font-body text-sm text-muted-foreground">
                        No submissions yet. List your first product above.
                      </p>
                    </div>
                  ) : (
                    partnerProducts.map((product, i) => {
                      const status = product.status as SubmissionStatus;
                      const cfg = statusConfig[status] ?? statusConfig.pending;
                      const StatusIcon = cfg.icon;
                      const ocidIndex = i + 1;
                      return (
                        <motion.div
                          key={String(product.id)}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-3 p-3 rounded-md bg-secondary/40 border border-border/50"
                          data-ocid={`partner.item.${ocidIndex}`}
                        >
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-12 h-12 rounded object-cover flex-shrink-0 bg-muted"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                              <Package className="text-muted-foreground w-5 h-5" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-body text-sm font-medium text-foreground truncate">
                                {product.name}
                              </p>
                              <Badge
                                className={`${cfg.className} font-body text-[10px] tracking-wide flex-shrink-0 flex items-center gap-1`}
                              >
                                <StatusIcon className="w-2.5 h-2.5" />
                                {cfg.label}
                              </Badge>
                            </div>
                            <p className="font-body text-xs text-gold font-semibold mt-0.5">
                              ${(Number(product.price) / 100).toFixed(2)}
                              <span className="text-muted-foreground font-normal ml-2">
                                · {product.category}
                              </span>
                            </p>
                            <p className="font-body text-[10px] text-muted-foreground/60 mt-1">
                              Submitted {formatDate(product.submittedAt)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* ── PAYOUT HISTORY ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                      <ArrowDownToLine className="text-gold w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="font-display text-base font-bold text-foreground">
                        Payout History
                      </CardTitle>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">
                        Earnings from your product sales
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  {payoutHistoryLoading ? (
                    <div
                      className="space-y-2"
                      data-ocid="partner.loading_state"
                    >
                      {["h1", "h2"].map((k) => (
                        <div
                          key={k}
                          className="p-3 rounded-md bg-secondary/40 border border-border/50 space-y-2"
                        >
                          <div className="flex justify-between">
                            <Skeleton className="h-4 w-1/3 bg-muted" />
                            <Skeleton className="h-4 w-1/4 bg-muted" />
                          </div>
                          <Skeleton className="h-3 w-1/2 bg-muted" />
                        </div>
                      ))}
                    </div>
                  ) : !payoutHistory || payoutHistory.length === 0 ? (
                    <div
                      className="text-center py-6"
                      data-ocid="partner.empty_state"
                    >
                      <DollarSign className="text-muted-foreground w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="font-body text-sm text-muted-foreground">
                        No payouts yet.
                      </p>
                      <p className="font-body text-xs text-muted-foreground/60 mt-1">
                        Once your products sell, your earnings appear here.
                      </p>
                    </div>
                  ) : (
                    payoutHistory.map((record, i) => {
                      const ocidIndex = i + 1;
                      return (
                        <motion.div
                          key={String(record.id)}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="p-3 rounded-md bg-secondary/40 border border-border/50"
                          data-ocid={`partner.row.${ocidIndex}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <p className="font-body text-sm font-medium text-foreground truncate flex-1">
                              {record.productName}
                            </p>
                            <span className="font-body text-sm font-bold text-emerald-400 flex-shrink-0">
                              +${(Number(record.partnerCut) / 100).toFixed(2)}
                            </span>
                          </div>
                          <Separator className="bg-border/40 my-1.5" />
                          <div className="flex items-center justify-between text-[11px] font-body text-muted-foreground/70">
                            <span>
                              Sale: $
                              {(Number(record.saleAmount) / 100).toFixed(2)}
                              <span className="mx-1.5 opacity-40">·</span>
                              Platform: $
                              {(Number(record.platformCut) / 100).toFixed(2)}
                            </span>
                            <span>{formatDate(record.timestamp)}</span>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* ── ADMIN: REFUND REQUESTS ── */}
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.63 }}
              >
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                        <RefreshCw className="text-gold w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="font-display text-base font-bold text-foreground flex items-center gap-2">
                          Refund Requests
                          <Badge className="bg-secondary text-gold border-gold/30 font-body text-[10px]">
                            Admin
                          </Badge>
                        </CardTitle>
                        <p className="font-body text-xs text-muted-foreground mt-0.5">
                          {refundsLoading
                            ? "Loading…"
                            : `${allRefundRequests?.length ?? 0} total request${(allRefundRequests?.length ?? 0) !== 1 ? "s" : ""}`}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {refundsLoading ? (
                      <div
                        className="space-y-2"
                        data-ocid="partner.loading_state"
                      >
                        {["r1", "r2"].map((k) => (
                          <div
                            key={k}
                            className="p-3 rounded-md bg-secondary/40 border border-border/50 space-y-2"
                          >
                            <div className="flex justify-between">
                              <Skeleton className="h-4 w-1/3 bg-muted" />
                              <Skeleton className="h-4 w-16 bg-muted" />
                            </div>
                            <Skeleton className="h-3 w-1/2 bg-muted" />
                          </div>
                        ))}
                      </div>
                    ) : !allRefundRequests || allRefundRequests.length === 0 ? (
                      <div
                        className="text-center py-6"
                        data-ocid="partner.refunds.empty_state"
                      >
                        <AlertCircle className="text-muted-foreground w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="font-body text-sm text-muted-foreground">
                          No refund requests yet.
                        </p>
                      </div>
                    ) : (
                      allRefundRequests.map((req, i) => {
                        const ocidIndex = i + 1;
                        const isPending = req.status === "pending";
                        const statusCfg =
                          statusConfig[req.status as SubmissionStatus] ??
                          statusConfig.pending;
                        const StatusIcon = statusCfg.icon;

                        const handleApprove = async () => {
                          try {
                            await updateRefundStatus.mutateAsync({
                              requestId: req.id,
                              status: "approved",
                            });
                            toast.success("Refund approved");
                          } catch {
                            toast.error("Failed to approve refund");
                          }
                        };

                        const handleReject = async () => {
                          try {
                            await updateRefundStatus.mutateAsync({
                              requestId: req.id,
                              status: "rejected",
                            });
                            toast.success("Refund rejected");
                          } catch {
                            toast.error("Failed to reject refund");
                          }
                        };

                        return (
                          <motion.div
                            key={String(req.id)}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="p-3 rounded-md bg-secondary/40 border border-border/50"
                            data-ocid={`partner.refund.item.${ocidIndex}`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="min-w-0 flex-1">
                                <p className="font-body text-xs text-muted-foreground tracking-widest uppercase mb-0.5">
                                  Order #{String(req.orderId).padStart(4, "0")}
                                </p>
                                <p className="font-body text-sm font-medium text-foreground">
                                  {req.reason}
                                </p>
                              </div>
                              <Badge
                                className={`${statusCfg.className} font-body text-[10px] tracking-wide flex-shrink-0 flex items-center gap-1`}
                              >
                                <StatusIcon className="w-2.5 h-2.5" />
                                {statusCfg.label}
                              </Badge>
                            </div>

                            {req.description && (
                              <p className="font-body text-xs text-muted-foreground/70 leading-relaxed mb-2">
                                {req.description}
                              </p>
                            )}

                            <Separator className="bg-border/40 my-2" />

                            <div className="flex items-center justify-between text-[11px] font-body text-muted-foreground/60">
                              <span className="truncate">
                                {shortenPrincipal(req.requesterPrincipal)}
                              </span>
                              <span className="flex-shrink-0 ml-2">
                                {formatDate(req.submittedAt)}
                              </span>
                            </div>

                            {isPending && (
                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="sm"
                                  onClick={handleApprove}
                                  disabled={updateRefundStatus.isPending}
                                  className="flex-1 bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-400 border border-emerald-500/30 hover:border-emerald-400/50 font-body text-xs transition-all duration-200"
                                  data-ocid={`partner.refund.confirm_button.${ocidIndex}`}
                                >
                                  {updateRefundStatus.isPending ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Approve
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={handleReject}
                                  disabled={updateRefundStatus.isPending}
                                  className="flex-1 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 hover:border-destructive/50 font-body text-xs transition-all duration-200"
                                  data-ocid={`partner.refund.delete_button.${ocidIndex}`}
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </motion.div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── ADMIN: USER MANAGEMENT ── */}
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.66 }}
              >
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                        <UserCog className="text-gold w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="font-display text-base font-bold text-foreground flex items-center gap-2">
                          User Management
                          <Badge className="bg-secondary text-gold border-gold/30 font-body text-[10px]">
                            Admin
                          </Badge>
                        </CardTitle>
                        <p className="font-body text-xs text-muted-foreground mt-0.5">
                          {usersLoading
                            ? "Loading…"
                            : `${allUserEmails?.length ?? 0} registered user${(allUserEmails?.length ?? 0) !== 1 ? "s" : ""}`}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {usersLoading ? (
                      <div
                        className="space-y-2"
                        data-ocid="partner.loading_state"
                      >
                        {["u1", "u2", "u3"].map((k) => (
                          <div
                            key={k}
                            className="flex items-center justify-between p-3 rounded-md bg-secondary/40 border border-border/50"
                          >
                            <Skeleton className="h-4 w-1/2 bg-muted" />
                            <Skeleton className="h-7 w-20 bg-muted rounded" />
                          </div>
                        ))}
                      </div>
                    ) : !allUserEmails || allUserEmails.length === 0 ? (
                      <div
                        className="text-center py-6"
                        data-ocid="partner.users.empty_state"
                      >
                        <Users className="text-muted-foreground w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="font-body text-sm text-muted-foreground">
                          No registered users yet.
                        </p>
                      </div>
                    ) : (
                      allUserEmails.map((userEmail, i) => {
                        const ocidIndex = i + 1;
                        const isResettingThis = resetTargetEmail === userEmail;

                        const handleAdminReset = async (e: React.FormEvent) => {
                          e.preventDefault();
                          if (!adminNewPassword) {
                            toast.error("Please enter a new password");
                            return;
                          }
                          if (adminNewPassword.length < 8) {
                            toast.error(
                              "Password must be at least 8 characters",
                            );
                            return;
                          }
                          if (adminNewPassword !== adminConfirmPassword) {
                            toast.error("Passwords do not match");
                            return;
                          }
                          try {
                            const result = await adminResetPassword.mutateAsync(
                              {
                                email: userEmail,
                                newPassword: adminNewPassword,
                              },
                            );
                            if (result.ok) {
                              toast.success(`Password reset for ${userEmail}`);
                              setResetTargetEmail(null);
                              setAdminNewPassword("");
                              setAdminConfirmPassword("");
                            } else {
                              toast.error(
                                result.message || "Failed to reset password",
                              );
                            }
                          } catch {
                            toast.error(
                              "Failed to reset password. Please try again.",
                            );
                          }
                        };

                        return (
                          <motion.div
                            key={userEmail}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="rounded-md bg-secondary/40 border border-border/50 overflow-hidden"
                            data-ocid={`partner.users.item.${ocidIndex}`}
                          >
                            {/* User row */}
                            <div className="flex items-center justify-between gap-2 p-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                                  <span className="text-gold text-[11px] font-body font-semibold">
                                    {userEmail[0]?.toUpperCase() ?? "?"}
                                  </span>
                                </div>
                                <p className="font-body text-sm text-foreground truncate">
                                  {userEmail}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (isResettingThis) {
                                    setResetTargetEmail(null);
                                    setAdminNewPassword("");
                                    setAdminConfirmPassword("");
                                  } else {
                                    setResetTargetEmail(userEmail);
                                    setAdminNewPassword("");
                                    setAdminConfirmPassword("");
                                  }
                                }}
                                className="flex-shrink-0 border-border text-muted-foreground hover:text-gold hover:border-gold/40 font-body text-xs"
                                data-ocid={`partner.users.edit_button.${ocidIndex}`}
                              >
                                <KeyRound className="w-3 h-3 mr-1" />
                                {isResettingThis ? "Cancel" : "Reset"}
                              </Button>
                            </div>

                            {/* Inline reset form */}
                            {isResettingThis && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Separator className="bg-border/40" />
                                <form
                                  onSubmit={handleAdminReset}
                                  className="p-3 space-y-3"
                                >
                                  <p className="font-body text-[11px] text-muted-foreground/70">
                                    Set a new password for{" "}
                                    <span className="text-foreground font-medium">
                                      {userEmail}
                                    </span>
                                  </p>
                                  <div className="space-y-2">
                                    <Input
                                      type="password"
                                      placeholder="New password (min. 8 chars)"
                                      value={adminNewPassword}
                                      onChange={(e) =>
                                        setAdminNewPassword(e.target.value)
                                      }
                                      className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground/50 font-body text-sm focus-visible:ring-gold focus-visible:border-gold h-9"
                                      data-ocid={`partner.users.input.${ocidIndex}`}
                                      autoComplete="new-password"
                                    />
                                    <Input
                                      type="password"
                                      placeholder="Confirm new password"
                                      value={adminConfirmPassword}
                                      onChange={(e) =>
                                        setAdminConfirmPassword(e.target.value)
                                      }
                                      className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground/50 font-body text-sm focus-visible:ring-gold focus-visible:border-gold h-9"
                                      data-ocid={`partner.users.input.${ocidIndex}`}
                                      autoComplete="new-password"
                                    />
                                  </div>
                                  <Button
                                    type="submit"
                                    size="sm"
                                    disabled={adminResetPassword.isPending}
                                    className="w-full bg-gold text-primary-foreground hover:bg-gold-deep font-body text-xs tracking-wide font-medium"
                                    data-ocid={`partner.users.confirm_button.${ocidIndex}`}
                                  >
                                    {adminResetPassword.isPending ? (
                                      <>
                                        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                                        Resetting…
                                      </>
                                    ) : (
                                      <>
                                        <KeyRound className="w-3 h-3 mr-1.5" />
                                        Confirm Reset
                                      </>
                                    )}
                                  </Button>
                                </form>
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── CONTACT / HELP ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
            >
              <Card className="bg-card border-gold/20 overflow-hidden">
                {/* Subtle gold glow strip */}
                <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                      <Phone className="text-gold w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-foreground">
                        Need Help?
                      </h3>
                      <p className="font-body text-xs text-muted-foreground">
                        Reach us directly on:
                      </p>
                    </div>
                  </div>

                  <p className="font-display text-2xl font-bold text-gold tracking-wide mb-4">
                    0756 633 420
                  </p>

                  <a
                    href="tel:0756633420"
                    className="block"
                    data-ocid="partner.primary_button"
                  >
                    <Button className="w-full bg-gold text-primary-foreground hover:bg-gold-deep font-body text-sm tracking-wide font-medium transition-all duration-200">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}
