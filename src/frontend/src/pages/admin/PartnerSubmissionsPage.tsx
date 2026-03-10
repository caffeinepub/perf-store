import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";
import { ActionModal } from "../../components/admin/ActionModal";
import { StatusBadge } from "../../components/admin/StatusBadge";
import type { PartnerSubmission, SubmissionStatus } from "../../data/adminData";

interface Props {
  partners: PartnerSubmission[];
  onUpdatePartnerStatus: (
    id: number,
    status: "approved" | "rejected",
    notes?: string,
  ) => void;
}

export function PartnerSubmissionsPage({
  partners,
  onUpdatePartnerStatus,
}: Props) {
  const [filter, setFilter] = useState<SubmissionStatus | "all">("all");
  const [modalState, setModalState] = useState<{
    open: boolean;
    action: "approve" | "reject";
    id: number;
    name: string;
  } | null>(null);

  const filtered =
    filter === "all" ? partners : partners.filter((p) => p.status === filter);

  const openModal = (
    action: "approve" | "reject",
    id: number,
    name: string,
  ) => {
    setModalState({ open: true, action, id, name });
  };

  const handleConfirm = (notes: string) => {
    if (!modalState) return;
    const status = modalState.action === "approve" ? "approved" : "rejected";
    onUpdatePartnerStatus(modalState.id, status, notes);
    toast.success(`Partner ${status} successfully`);
    setModalState(null);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-foreground">
            Partner Applications
          </h2>
          <p className="font-body text-xs text-muted-foreground mt-0.5">
            {partners.filter((p) => p.status === "pending").length} pending
            review
          </p>
        </div>
      </div>

      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as SubmissionStatus | "all")}
      >
        <TabsList className="bg-secondary" data-ocid="partners.tab">
          <TabsTrigger value="all" className="font-body text-sm">
            All ({partners.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="font-body text-sm">
            Pending ({partners.filter((p) => p.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="font-body text-sm">
            Approved ({partners.filter((p) => p.status === "approved").length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="font-body text-sm">
            Rejected ({partners.filter((p) => p.status === "rejected").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                {[
                  "Name",
                  "Email",
                  "Phone",
                  "Business Type",
                  "Submitted",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center font-body text-sm text-muted-foreground"
                    data-ocid="partners.empty_state"
                  >
                    No {filter !== "all" ? filter : ""} submissions found
                  </td>
                </tr>
              ) : (
                filtered.map((partner, i) => (
                  <tr
                    key={partner.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                    data-ocid={`partners.item.${i + 1}`}
                  >
                    <td className="px-5 py-4">
                      <p className="font-body text-sm font-semibold text-foreground">
                        {partner.name}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-body text-sm text-muted-foreground">
                        {partner.email}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-mono text-sm text-foreground">
                        {partner.phone}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-secondary text-xs font-body font-medium text-foreground">
                        {partner.businessType}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-body text-sm text-muted-foreground">
                        {partner.submittedAt}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={partner.status} />
                    </td>
                    <td className="px-5 py-4">
                      {partner.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="h-7 px-3 bg-green-600 hover:bg-green-700 text-white font-body text-xs"
                            onClick={() =>
                              openModal("approve", partner.id, partner.name)
                            }
                            data-ocid={`partners.approve_button.${i + 1}`}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-3 border-destructive/40 text-destructive hover:bg-destructive/10 font-body text-xs"
                            onClick={() =>
                              openModal("reject", partner.id, partner.name)
                            }
                            data-ocid={`partners.reject_button.${i + 1}`}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="font-body text-xs text-muted-foreground">
                          {partner.status === "approved"
                            ? "Approved ✓"
                            : "Rejected ✗"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalState && (
        <ActionModal
          open={modalState.open}
          action={modalState.action}
          itemName={modalState.name}
          onConfirm={handleConfirm}
          onCancel={() => setModalState(null)}
        />
      )}
    </div>
  );
}
