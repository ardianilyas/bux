"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

type StatusChangeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUser: { id: string; name: string; status: string } | null;
  newStatus: "suspended" | "banned" | null;
  onConfirm: (reason: string, durationDays: number | undefined) => void;
  isLoading: boolean;
};

const DURATION_OPTIONS = [
  { value: "1", label: "1 day" },
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "permanent", label: "Permanent" },
];

export function StatusChangeDialog({
  open,
  onOpenChange,
  targetUser,
  newStatus,
  onConfirm,
  isLoading,
}: StatusChangeDialogProps) {
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("permanent");

  const handleClose = (open: boolean) => {
    if (!open) {
      setReason("");
      setDuration("permanent");
    }
    onOpenChange(open);
  };

  const handleSubmit = () => {
    const durationDays = duration === "permanent" ? undefined : Number(duration);
    onConfirm(reason, durationDays);
  };

  if (!targetUser || !newStatus) return null;

  const isBan = newStatus === "banned";
  const actionLabel = isBan ? "Ban" : "Suspend";
  const actionColor = isBan ? "bg-red-600 text-white hover:bg-red-700" : "bg-amber-600 text-white hover:bg-amber-700";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{actionLabel} User</DialogTitle>
          <DialogDescription>
            You are about to {actionLabel.toLowerCase()} <strong>{targetUser.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              placeholder={`Why is this user being ${actionLabel.toLowerCase()}ed?`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Duration - only for suspend */}
          {!isBan && (
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {duration !== "permanent" && (
                <p className="text-xs text-muted-foreground">
                  Suspension will expire on{" "}
                  {new Date(
                    Date.now() + Number(duration) * 24 * 60 * 60 * 1000
                  ).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {isBan && (
            <p className="text-xs text-muted-foreground">
              Bans are permanent and cannot expire automatically.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className={actionColor}
            onClick={handleSubmit}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? `${actionLabel}ning...` : actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
