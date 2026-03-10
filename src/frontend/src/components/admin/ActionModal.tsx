import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface Props {
  open: boolean;
  action: "approve" | "reject";
  itemName: string;
  onConfirm: (notes: string) => void;
  onCancel: () => void;
}

export function ActionModal({
  open,
  action,
  itemName,
  onConfirm,
  onCancel,
}: Props) {
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    onConfirm(notes);
    setNotes("");
  };

  const handleCancel = () => {
    setNotes("");
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleCancel()}>
      <DialogContent className="sm:max-w-md" data-ocid="approve.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            {action === "approve" ? "Approve" : "Reject"} Submission
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-4">
          <p className="font-body text-sm text-muted-foreground">
            You are about to{" "}
            <span
              className={`font-semibold ${
                action === "approve" ? "text-green-600" : "text-destructive"
              }`}
            >
              {action}
            </span>{" "}
            <span className="font-semibold text-foreground">{itemName}</span>.
          </p>

          <div className="space-y-1.5">
            <Label className="font-body text-sm">
              Notes{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              placeholder="Add a note for your records…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="font-body text-sm resize-none h-24"
              data-ocid="approve.notes_input"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="font-body"
            data-ocid="approve.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className={`font-body ${
              action === "approve"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            }`}
            data-ocid="approve.confirm_button"
          >
            {action === "approve" ? "Confirm Approval" : "Confirm Rejection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
