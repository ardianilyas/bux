"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { SavingsGoal } from "../types";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

type AddFundsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: SavingsGoal | null;
  onAddFunds: (amount: number) => void;
  isLoading: boolean;
  userBaseCurrency: string;
};

const PRESET_AMOUNTS = [50000, 100000, 500000, 1000000];

export function AddFundsDialog({
  open,
  onOpenChange,
  goal,
  onAddFunds,
  isLoading,
  userBaseCurrency,
}: AddFundsDialogProps) {
  const [customAmount, setCustomAmount] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  const handlePresetClick = (amount: number) => {
    setSelectedPreset(amount);
    setCustomAmount("");
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    setSelectedPreset(null);
  };

  const getAmount = () => {
    if (selectedPreset) return selectedPreset;
    if (customAmount) return Number(customAmount);
    return 0;
  };

  const handleSubmit = () => {
    const amount = getAmount();
    if (amount > 0) {
      onAddFunds(amount);
      // Reset state after successful submission
      setCustomAmount("");
      setSelectedPreset(null);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setCustomAmount("");
      setSelectedPreset(null);
    }
    onOpenChange(open);
  };

  if (!goal) return null;

  const amount = getAmount();
  const newTotal = goal.currentAmount + amount;
  const newPercent = Math.min((newTotal / goal.targetAmount) * 100, 100);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Funds to "{goal.name}"</DialogTitle>
          <DialogDescription>
            Current balance: {formatCurrency(goal.currentAmount, userBaseCurrency)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Preset amounts */}
          <div className="space-y-2">
            <Label>Quick amounts</Label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={selectedPreset === preset ? "default" : "outline"}
                  className="w-full"
                  onClick={() => handlePresetClick(preset)}
                >
                  +{formatCurrency(preset, userBaseCurrency)}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div className="space-y-2">
            <Label htmlFor="customAmount">Or enter custom amount</Label>
            <Input
              id="customAmount"
              type="number"
              min="0"
              step="1000"
              value={customAmount}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder="Enter amount..."
            />
          </div>

          {/* Preview */}
          {amount > 0 && (
            <div className="p-3 bg-muted rounded-lg space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Adding:</span>
                <span className="font-medium text-green-600">
                  +{formatCurrency(amount, userBaseCurrency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">New balance:</span>
                <span className="font-medium">
                  {formatCurrency(newTotal, userBaseCurrency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress:</span>
                <span className="font-medium">{Math.round(newPercent)}%</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || amount <= 0}
            >
              {isLoading ? "Adding..." : "Add Funds"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
