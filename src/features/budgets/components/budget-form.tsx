"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BudgetFormData, Budget } from "../types";

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
          <Select
            value={formData.categoryId}
            onValueChange={(value) =>
              setFormData({ ...formData, categoryId: value })
            }
          >
            <SelectTrigger>
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
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="e.g. 500"
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={isLoading}>
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
