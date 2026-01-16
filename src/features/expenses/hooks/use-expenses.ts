"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import type { ExpenseFilters } from "../types";

export function useExpenses(filters?: ExpenseFilters) {
  return trpc.expense.list.useQuery(
    {
      page: filters?.page,
      pageSize: filters?.pageSize,
      search: filters?.search || undefined,
      categoryId: filters?.categoryId === "all" ? undefined : filters?.categoryId,
      startDate: filters?.startDate || undefined,
      endDate: filters?.endDate || undefined,
    },
    { placeholderData: (previousData) => previousData }
  );
}

export function useExpenseById(id: string) {
  return trpc.expense.getById.useQuery({ id });
}

export function useCreateExpense() {
  const utils = trpc.useUtils();

  return trpc.expense.create.useMutation({
    onSuccess: () => {
      toast.success("Expense created successfully");
      utils.expense.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create expense");
    },
  });
}

export function useUpdateExpense() {
  const utils = trpc.useUtils();

  return trpc.expense.update.useMutation({
    onSuccess: () => {
      toast.success("Expense updated successfully");
      utils.expense.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update expense");
    },
  });
}

export function useDeleteExpense() {
  const utils = trpc.useUtils();

  return trpc.expense.delete.useMutation({
    onSuccess: () => {
      toast.success("Expense deleted successfully");
      utils.expense.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete expense");
    },
  });
}
