"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { InputError } from "@/components/ui/input-error";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES } from "@/lib/currency";
import { fetchExchangeRate } from "@/lib/exchange-rate";
import { expenseSchema } from "@/lib/validations/expense";
import { useSession } from "@/features/auth/hooks/use-auth";
import { z } from "zod";
import { useState, useEffect } from "react";

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
  currency: string;
  exchangeRate: string;
  merchant?: string;
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
  const { data: session } = useSession();
  const userBaseCurrency = (session?.user as any)?.currency || "IDR";

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
  const [fetchingRate, setFetchingRate] = useState(false);

  // Fetch exchange rate when currency changes
  useEffect(() => {
    const fetchRate = async () => {
      if (formData.currency === userBaseCurrency) {
        setFormData({ ...formData, exchangeRate: "1" });
        return;
      }

      setFetchingRate(true);
      const rate = await fetchExchangeRate(formData.currency, userBaseCurrency);
      setFetchingRate(false);

      if (rate) {
        setFormData({ ...formData, exchangeRate: rate.toString() });
      }
    };

    if (formData.currency && formData.currency !== userBaseCurrency) {
      fetchRate();
    }
  }, [formData.currency, userBaseCurrency]);

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
        merchant: formData.merchant || undefined,
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

      <div className="space-y-2">
        <Label htmlFor="merchant">Merchant (Optional)</Label>
        <Input
          id="merchant"
          value={formData.merchant || ""}
          onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
          placeholder="e.g. Starbucks, Uber, Amazon"
        />
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
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => handleChange("currency", value)}
          >
            <SelectTrigger id="currency">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.code} - {currency.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.currency !== userBaseCurrency && (
        <div className="space-y-2">
          <Label htmlFor="exchangeRate">
            Exchange Rate ({formData.currency} to {userBaseCurrency})
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="exchangeRate"
              type="number"
              step="0.000001"
              min="0"
              value={formData.exchangeRate}
              onChange={(e) => handleChange("exchangeRate", e.target.value)}
              placeholder="1.0"
              disabled={fetchingRate}
            />
            {fetchingRate && (
              <span className="text-sm text-muted-foreground">Fetching...</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            1 {formData.currency} = {formData.exchangeRate} {userBaseCurrency}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <DatePicker
          id="date"
          date={formData.date ? new Date(formData.date) : undefined}
          setDate={(date) => {
            const val = date ? format(date, "yyyy-MM-dd") : "";
            handleChange("date", val);
            setTouched((prev) => ({ ...prev, date: true }));
            validateField("date", val);
          }}
          className={errors.date ? "border-destructive w-full" : "w-full"}
        />
        <InputError message={errors.date} />
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
