import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Download, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TransactionBadge } from "../../components/admin/StatusBadge";
import type {
  EarningsTransaction,
  TransactionType,
} from "../../data/adminData";

interface Props {
  transactions: EarningsTransaction[];
  onAddTransaction: (tx: Omit<EarningsTransaction, "id" | "date">) => void;
}

function exportToCSV(transactions: EarningsTransaction[]) {
  const headers = ["Type", "Amount (KES)", "Description", "Partner", "Date"];
  const rows = transactions.map((tx) => [
    tx.type,
    tx.amount.toString(),
    `"${tx.description.replace(/"/g, '""')}"`,
    `"${tx.partner.replace(/"/g, '""')}"`,
    tx.date,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `perf-store-earnings-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function EarningsPage({ transactions, onAddTransaction }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<{
    type: TransactionType;
    amount: string;
    description: string;
    partner: string;
  }>({
    type: "commission",
    amount: "",
    description: "",
    partner: "",
  });

  const totalCommission = transactions
    .filter((t) => t.type === "commission")
    .reduce((s, t) => s + t.amount, 0);
  const totalWithdrawn = transactions
    .filter((t) => t.type === "withdrawal")
    .reduce((s, t) => s + t.amount, 0);
  const totalDeposited = transactions
    .filter((t) => t.type === "deposit")
    .reduce((s, t) => s + t.amount, 0);
  const balance = totalCommission + totalDeposited - totalWithdrawn;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number.parseFloat(form.amount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    onAddTransaction({
      type: form.type,
      amount,
      description: form.description || `${form.type} transaction`,
      partner: form.partner || "—",
    });
    toast.success("Transaction recorded successfully");
    setModalOpen(false);
    setForm({ type: "commission", amount: "", description: "", partner: "" });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Balance",
            value: balance,
            color: "text-green-600",
            bg: "bg-green-50",
            border: "border-green-100",
          },
          {
            label: "Total Commission In",
            value: totalCommission,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
          },
          {
            label: "Total Withdrawn",
            value: totalWithdrawn,
            color: "text-red-600",
            bg: "bg-red-50",
            border: "border-red-100",
          },
          {
            label: "Total Deposited",
            value: totalDeposited,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100",
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border ${card.border} ${card.bg} p-5 shadow-card`}
          >
            <p className="font-body text-xs text-muted-foreground mb-1">
              {card.label}
            </p>
            <p className={`font-display text-xl font-bold ${card.color}`}>
              KES {card.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Transaction history */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-foreground">
            Transaction History
          </h2>
          <p className="font-body text-xs text-muted-foreground mt-0.5">
            {transactions.length} transactions total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (transactions.length === 0) {
                toast.error("No transactions to export");
                return;
              }
              exportToCSV(transactions);
              toast.success("Earnings report downloaded");
            }}
            className="h-9 px-4 font-body text-sm gap-2"
            data-ocid="earnings.export_button"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            onClick={() => setModalOpen(true)}
            className="h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-body text-sm gap-2"
            data-ocid="earnings.add_button"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                {["Type", "Amount", "Description", "Partner", "Date"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center font-body text-sm text-muted-foreground"
                    data-ocid="earnings.empty_state"
                  >
                    No transactions yet
                  </td>
                </tr>
              ) : (
                transactions.map((tx, i) => (
                  <tr
                    key={tx.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                    data-ocid={`earnings.item.${i + 1}`}
                  >
                    <td className="px-5 py-4">
                      <TransactionBadge type={tx.type} />
                    </td>
                    <td className="px-5 py-4">
                      <p
                        className={`font-mono text-sm font-semibold ${
                          tx.type === "withdrawal"
                            ? "text-destructive"
                            : "text-green-600"
                        }`}
                      >
                        {tx.type === "withdrawal" ? "-" : "+"}KES{" "}
                        {tx.amount.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-body text-sm text-foreground">
                        {tx.description}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-body text-sm text-muted-foreground">
                        {tx.partner}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-body text-sm text-muted-foreground">
                        {tx.date}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Dialog open={modalOpen} onOpenChange={(o) => !o && setModalOpen(false)}>
        <DialogContent className="sm:max-w-md" data-ocid="earnings.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Record Transaction
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="font-body text-sm font-medium">Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, type: v as TransactionType }))
                }
              >
                <SelectTrigger
                  className="font-body"
                  data-ocid="earnings.type_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commission" className="font-body">
                    Commission In
                  </SelectItem>
                  <SelectItem value="withdrawal" className="font-body">
                    Withdrawal
                  </SelectItem>
                  <SelectItem value="deposit" className="font-body">
                    Deposit
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-body text-sm font-medium">
                Amount (KES)
              </Label>
              <Input
                type="number"
                min="1"
                placeholder="e.g. 1500"
                value={form.amount}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, amount: e.target.value }))
                }
                required
                className="font-body"
                data-ocid="earnings.amount_input"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-body text-sm font-medium">
                Description
              </Label>
              <Textarea
                placeholder="Brief description of this transaction…"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="font-body text-sm resize-none h-20"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-body text-sm font-medium">
                Partner{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                placeholder="Partner name if applicable"
                value={form.partner}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, partner: e.target.value }))
                }
                className="font-body"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="font-body"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-body"
                data-ocid="earnings.submit_button"
              >
                Record Transaction
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
