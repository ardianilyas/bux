"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputError } from "@/components/ui/input-error";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BudgetFormData, Budget } from "../types";
import { budgetSchema } from "@/lib/validations/budget";
import { z } from "zod";
import { useState } from "react";

type Category = {
  id: string;
  name: string;
  color: string;
};

type BudgetFormProps = {
  onSubmit: () => void;
  isLoading: boolean;
  submitLabel: string;
  formData: BudgetFormData;
  setFormData: (data: BudgetFormData) => void;
  onCancel: () => void;
  availableCategories?: Category[];
  editingBudget?: Budget | null;
};

export function BudgetForm({
  onSubmit,
  isLoading,
  submitLabel,
  formData,
  setFormData,
  onCancel,
  availableCategories,
  editingBudget,
}: BudgetFormProps) {
  const isEditing = !!editingBudget;
  const [errors, setErrors] = useState<{ categoryId?: string; amount?: string }>({});
  const [touched, setTouched] = useState<{ amount?: boolean }>({});

  const validateField = (field: "categoryId" | "amount", value: string) => {
    try {
      budgetSchema.shape[field].parse(value);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: error.issues[0]?.message }));
      }
    }
  };

  const handleBlur = () => {
    setTouched({ amount: true });
    validateField("amount", formData.amount);
  };

  const handleAmountChange = (value: string) => {
    setFormData({ ...formData, amount: value });
    if (touched.amount) {
      validateField("amount", value);
    }
  };

  const handleSubmit = () => {
    try {
      budgetSchema.parse(formData);
      setErrors({});
      onSubmit();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { categoryId?: string; amount?: string } = {};
        error.issues.forEach((err) => {
          const field = err.path[0] as "categoryId" | "amount";
          if (field) {
            fieldErrors[field] = err.message;
          }
        });
        setErrors(fieldErrors);
        setTouched({ amount: true });
      }
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        {isEditing ? (
          <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: editingBudget?.category.color }}
            />
            <span className="text-foreground">
              {editingBudget?.category.name}
            </span>
          </div>
        ) : (
          <>
            <Select
              value={formData.categoryId}
              onValueChange={(value) =>
                setFormData({ ...formData, categoryId: value })
              }
            >
              <SelectTrigger className={errors.categoryId ? "border-destructive" : ""}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <InputError message={errors.categoryId} />
          </>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Monthly Limit</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={(e) => handleAmountChange(e.target.value)}
          onBlur={handleBlur}
          placeholder="e.g. 500"
          className={errors.amount ? "border-destructive" : ""}
        />
        <InputError message={errors.amount} />
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
