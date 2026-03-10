import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { ActionModal } from "../../components/admin/ActionModal";
import { StatusBadge } from "../../components/admin/StatusBadge";
import type { StoreSubmission } from "../../data/adminData";

interface Props {
  stores: StoreSubmission[];
  onUpdateStoreStatus: (
    id: number,
    status: "approved" | "rejected",
    notes?: string,
  ) => void;
}

export function StoreSubmissionsPage({ stores, onUpdateStoreStatus }: Props) {
  const [modalState, setModalState] = useState<{
    open: boolean;
    action: "approve" | "reject";
    id: number;
    name: string;
  } | null>(null);

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
    onUpdateStoreStatus(modalState.id, status, notes);
    toast.success(`Store ${status} successfully`);
    setModalState(null);
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="font-display text-base font-bold text-foreground">
          Store Applications
        </h2>
        <p className="font-body text-xs text-muted-foreground mt-0.5">
          {stores.filter((s) => s.status === "pending").length} pending review
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                {[
                  "Store Name",
                  "Partner Name",
                  "Email",
                  "Location",
                  "Category",
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
              {stores.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center font-body text-sm text-muted-foreground"
                    data-ocid="stores.empty_state"
                  >
                    No store submissions found
                  </td>
                </tr>
              ) : (
                stores.map((store, i) => (
                  <tr
                    key={store.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                    data-ocid={`stores.item.${i + 1}`}
                  >
                    <td className="px-5 py-4">
                      <p className="font-body text-sm font-semibold text-foreground">
                        {store.storeName}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-body text-sm text-foreground">
                        {store.partnerName}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-body text-sm text-muted-foreground">
                        {store.email}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-body text-sm text-foreground">
                        {store.location}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-secondary text-xs font-body font-medium text-foreground">
                        {store.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-body text-sm text-muted-foreground">
                        {store.submittedAt}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={store.status} />
                    </td>
                    <td className="px-5 py-4">
                      {store.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="h-7 px-3 bg-green-600 hover:bg-green-700 text-white font-body text-xs"
                            onClick={() =>
                              openModal("approve", store.id, store.storeName)
                            }
                            data-ocid={`stores.approve_button.${i + 1}`}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-3 border-destructive/40 text-destructive hover:bg-destructive/10 font-body text-xs"
                            onClick={() =>
                              openModal("reject", store.id, store.storeName)
                            }
                            data-ocid={`stores.reject_button.${i + 1}`}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="font-body text-xs text-muted-foreground">
                          {store.status === "approved"
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
