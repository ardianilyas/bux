"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import type { Expense } from "@/features/expenses/types";

export function useBudgets() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = trpc.budget.list.useQuery({ page, pageSize });

  return {
    budgets: data?.data || [],
    pagination: data?.pagination,
    page,
    setPage,
    isLoading
  };
}

export function useBudgetById(id: string) {
  return trpc.budget.getById.useQuery({ id });
}

export function useCreateBudget() {
  const utils = trpc.useUtils();

  return trpc.budget.create.useMutation({
    onSuccess: () => {
      toast.success("Budget created successfully");
      utils.budget.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create budget");
    },
  });
}

export function useUpdateBudget() {
  const utils = trpc.useUtils();

  return trpc.budget.update.useMutation({
    onSuccess: () => {
      toast.success("Budget updated successfully");
      utils.budget.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update budget");
    },
  });
}

export function useDeleteBudget() {
  const utils = trpc.useUtils();

  return trpc.budget.delete.useMutation({
    onSuccess: () => {
      toast.success("Budget deleted successfully");
      utils.budget.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete budget");
    },
  });
}

/**
 * Calculate current month spending for a specific category
 */
import { convertToBaseCurrency } from "@/lib/currency-conversion";

/**
 * Calculate current month spending for a specific category
 */
export function getMonthlySpending(
  expenses: Expense[] | undefined,
  categoryId: string,
  userBaseCurrency: string = "IDR"
): number {
  if (!expenses) return 0;
  const now = new Date();
  return expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expense.categoryId === categoryId &&
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, expense) => {
      return sum + convertToBaseCurrency(expense, userBaseCurrency);
    }, 0);
}
