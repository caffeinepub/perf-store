import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  CheckCircle2,
  Clock,
  Copy,
  Link,
  LogOut,
  Package,
  PackagePlus,
  Percent,
  Phone,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { usePartnerStats } from "../hooks/useQueries";

type SubmissionStatus = "pending" | "approved" | "rejected";

interface SubmittedProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  category: string;
  status: SubmissionStatus;
  submittedAt: string;
}

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

export function PartnerPage() {
  const { data: stats, isLoading } = usePartnerStats();
  const { clear } = useInternetIdentity();
  const [copied, setCopied] = useState(false);

  // Product submission form state
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productImageUrl, setProductImageUrl] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedProducts, setSubmittedProducts] = useState<
    SubmittedProduct[]
  >([]);

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

  const handleProductSubmit = (e: React.FormEvent) => {
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

    setIsSubmitting(true);

    // Simulate async submission
    setTimeout(() => {
      const newProduct: SubmittedProduct = {
        id: `prod_${Date.now()}`,
        name: productName.trim(),
        price,
        imageUrl: productImageUrl.trim(),
        description: productDescription.trim(),
        category: productCategory.trim(),
        status: "pending",
        submittedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };
      setSubmittedProducts((prev) => [newProduct, ...prev]);

      // Reset form
      setProductName("");
      setProductPrice("");
      setProductImageUrl("");
      setProductDescription("");
      setProductCategory("");
      setIsSubmitting(false);

      toast.success(
        "Product submitted! It will appear in the store once approved.",
      );
    }, 800);
  };

  const statCards = [
    {
      icon: TrendingUp,
      label: "Total Sales",
      value: stats ? `$${Number(stats.totalSales).toLocaleString()}` : "$0",
      description: "Lifetime revenue",
      ocid: "partner.card.1",
    },
    {
      icon: Percent,
      label: "Commission",
      value: stats ? `$${Number(stats.commission).toLocaleString()}` : "$0",
      description: "10% of total sales",
      ocid: "partner.card.2",
    },
  ];

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

      <main className="px-4 py-6 space-y-4">
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

            {/* Referral link card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-lg p-5 hover:border-gold/30 transition-colors"
              data-ocid="partner.card.3"
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
              transition={{ delay: 0.3 }}
              className="bg-secondary/50 border border-border rounded-lg p-4"
            >
              <p className="font-body text-xs text-muted-foreground leading-relaxed">
                <span className="text-gold font-medium">Partner program: </span>
                Earn 10% commission on every sale referred through your unique
                link. Share your referral link to start earning today.
              </p>
            </motion.div>

            {/* ── LIST YOUR PRODUCT ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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

                    {/* Image URL */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="product-image"
                        className="font-body text-xs text-muted-foreground tracking-widest uppercase"
                      >
                        Image URL
                      </Label>
                      <Input
                        id="product-image"
                        placeholder="https://example.com/image.jpg"
                        value={productImageUrl}
                        onChange={(e) => setProductImageUrl(e.target.value)}
                        className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 font-body text-sm focus:border-gold/60"
                        data-ocid="partner.input"
                      />
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
                      disabled={isSubmitting}
                      className="w-full bg-gold text-primary-foreground hover:bg-gold-deep font-body text-sm tracking-wide font-medium transition-all duration-200 disabled:opacity-60"
                      data-ocid="partner.submit_button"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin mr-2" />
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

            {/* ── SUBMITTED PRODUCTS LIST ── */}
            {submittedProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
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
                          {submittedProducts.length} product
                          {submittedProducts.length !== 1 ? "s" : ""} submitted
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {submittedProducts.map((product, i) => {
                      const cfg = statusConfig[product.status];
                      const StatusIcon = cfg.icon;
                      const ocidIndex = i + 1;
                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-3 p-3 rounded-md bg-secondary/40 border border-border/50"
                          data-ocid={`partner.item.${ocidIndex}`}
                        >
                          {/* Thumbnail */}
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
                              ${product.price.toFixed(2)}
                              <span className="text-muted-foreground font-normal ml-2">
                                · {product.category}
                              </span>
                            </p>
                            <p className="font-body text-[10px] text-muted-foreground/60 mt-1">
                              Submitted {product.submittedAt}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── CONTACT / HELP ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
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
