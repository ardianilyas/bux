"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputError } from "@/components/ui/input-error";
import type { SavingsGoalFormData, SavingsGoal } from "../types";
import { useState } from "react";
import { z } from "zod";

const savingsGoalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Target amount must be a positive number",
  }),
  currentAmount: z.string().refine((val) => val === "" || (!isNaN(Number(val)) && Number(val) >= 0), {
    message: "Current amount must be zero or positive",
  }),
  color: z.string(),
  targetDate: z.string().optional(),
});

type FormState = {
  name: string;
  targetAmount: string;
  currentAmount: string;
  color: string;
  targetDate: string;
};

type SavingsGoalFormProps = {
  onSubmit: (data: SavingsGoalFormData) => void;
  isLoading: boolean;
  submitLabel: string;
  onCancel: () => void;
  editingGoal?: SavingsGoal | null;
};

const defaultColors = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#84cc16", // Lime
];

export function SavingsGoalForm({
  onSubmit,
  isLoading,
  submitLabel,
  onCancel,
  editingGoal,
}: SavingsGoalFormProps) {
  const [formData, setFormData] = useState<FormState>({
    name: editingGoal?.name || "",
    targetAmount: editingGoal?.targetAmount?.toString() || "",
    currentAmount: editingGoal?.currentAmount?.toString() || "0",
    color: editingGoal?.color || "#6366f1",
    targetDate: editingGoal?.targetDate
      ? new Date(editingGoal.targetDate).toISOString().split("T")[0]
      : "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: string) => {
    try {
      savingsGoalSchema.shape[field as keyof typeof savingsGoalSchema.shape].parse(value);
      setErrors((prev) => ({ ...prev, [field]: "" }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: error.issues[0]?.message || "" }));
      }
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field as keyof FormState]);
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleSubmit = () => {
    try {
      savingsGoalSchema.parse(formData);
      setErrors({});
      onSubmit({
        name: formData.name,
        targetAmount: Number(formData.targetAmount),
        currentAmount: Number(formData.currentAmount) || 0,
        color: formData.color,
        targetDate: formData.targetDate ? new Date(formData.targetDate) : null,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          const field = err.path[0] as string;
          if (field) {
            fieldErrors[field] = err.message;
          }
        });
        setErrors(fieldErrors);
        setTouched({ name: true, targetAmount: true, currentAmount: true });
      }
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Goal Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          onBlur={() => handleBlur("name")}
          placeholder="e.g. New Macbook"
          className={errors.name ? "border-destructive" : ""}
        />
        <InputError message={errors.name} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetAmount">Target Amount</Label>
          <Input
            id="targetAmount"
            type="number"
            step="0.01"
            min="0"
            value={formData.targetAmount}
            onChange={(e) => handleChange("targetAmount", e.target.value)}
            onBlur={() => handleBlur("targetAmount")}
            placeholder="e.g. 5000000"
            className={errors.targetAmount ? "border-destructive" : ""}
          />
          <InputError message={errors.targetAmount} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentAmount">Current Amount</Label>
          <Input
            id="currentAmount"
            type="number"
            step="0.01"
            min="0"
            value={formData.currentAmount}
            onChange={(e) => handleChange("currentAmount", e.target.value)}
            onBlur={() => handleBlur("currentAmount")}
            placeholder="e.g. 1000000"
            className={errors.currentAmount ? "border-destructive" : ""}
          />
          <InputError message={errors.currentAmount} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetDate">Target Date (optional)</Label>
        <Input
          id="targetDate"
          type="date"
          value={formData.targetDate}
          onChange={(e) => handleChange("targetDate", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex gap-2 flex-wrap">
          {defaultColors.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full transition-all ${formData.color === color
                  ? "ring-2 ring-offset-2 ring-primary"
                  : "hover:scale-110"
                }`}
              style={{ backgroundColor: color }}
              onClick={() => handleChange("color", color)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
