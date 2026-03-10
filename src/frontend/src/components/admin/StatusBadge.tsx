import type { SubmissionStatus, TransactionType } from "../../data/adminData";

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  const classes = {
    pending:
      "status-pending px-2.5 py-0.5 rounded-full text-xs font-body font-semibold border",
    approved:
      "status-approved px-2.5 py-0.5 rounded-full text-xs font-body font-semibold border",
    rejected:
      "status-rejected px-2.5 py-0.5 rounded-full text-xs font-body font-semibold border",
  };
  const labels = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };
  return <span className={classes[status]}>{labels[status]}</span>;
}

export function TransactionBadge({ type }: { type: TransactionType }) {
  const classes = {
    commission:
      "badge-commission px-2.5 py-0.5 rounded-full text-xs font-body font-semibold",
    withdrawal:
      "badge-withdrawal px-2.5 py-0.5 rounded-full text-xs font-body font-semibold",
    deposit:
      "badge-deposit px-2.5 py-0.5 rounded-full text-xs font-body font-semibold",
  };
  const labels = {
    commission: "Commission In",
    withdrawal: "Withdrawal",
    deposit: "Deposit",
  };
  return <span className={classes[type]}>{labels[type]}</span>;
}
