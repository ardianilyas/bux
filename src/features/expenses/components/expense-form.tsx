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
import { expenseSchema } from "@/lib/validations/expense";
import { z } from "zod";
import { useState } from "react";

type Category = {
  id: string;
  name: string;
  color: string;
};

type ExpenseFormData = {
  description: string;
  amount: string;
  date: string;
  categoryId: string;
};

type ExpenseFormProps = {
  onSubmit: () => void;
  isLoading: boolean;
  submitLabel: string;
  formData: ExpenseFormData;
  setFormData: (data: ExpenseFormData) => void;
  onCancel: () => void;
  categories?: Category[];
};

export function ExpenseForm({
  onSubmit,
  isLoading,
  submitLabel,
  formData,
  setFormData,
  onCancel,
  categories,
}: ExpenseFormProps) {
  const [errors, setErrors] = useState<{
    description?: string;
    amount?: string;
    date?: string;
  }>({});
  const [touched, setTouched] = useState<{
    description?: boolean;
    amount?: boolean;
    date?: boolean;
  }>({});

  const validateField = (field: "description" | "amount" | "date", value: string) => {
    try {
      expenseSchema.shape[field].parse(value);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: error.issues[0]?.message }));
      }
    }
  };

  const handleBlur = (field: "description" | "amount" | "date") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleChange = (field: keyof ExpenseFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (touched[field as keyof typeof touched]) {
      validateField(field as "description" | "amount" | "date", value);
    }
  };

  const handleSubmit = () => {
    // Validate all fields
    try {
      expenseSchema.parse({
        description: formData.description,
        amount: formData.amount,
        date: formData.date,
        categoryId: formData.categoryId || undefined,
      });
      setErrors({});
      onSubmit();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          const field = err.path[0] as string;
          if (field && field !== "categoryId") {
            fieldErrors[field] = err.message;
          }
        });
        setErrors(fieldErrors);
        setTouched({ description: true, amount: true, date: true });
      }
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          onBlur={() => handleBlur("description")}
          placeholder="e.g. Coffee, Groceries, Rent"
          className={errors.description ? "border-destructive" : ""}
          autoFocus
        />
        <InputError message={errors.description} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            onBlur={() => handleBlur("amount")}
            placeholder="0.00"
            className={errors.amount ? "border-destructive" : ""}
          />
          <InputError message={errors.amount} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            onBlur={() => handleBlur("date")}
            className={errors.date ? "border-destructive" : ""}
          />
          <InputError message={errors.date} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.categoryId}
          onValueChange={(value) =>
            handleChange("categoryId", value === "none" ? "" : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Category</SelectItem>
            {categories?.map((category) => (
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
