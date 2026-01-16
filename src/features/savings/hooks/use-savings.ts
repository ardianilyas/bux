"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import type {
  SavingsGoal,
  CreateSavingsGoalInput,
  UpdateSavingsGoalInput,
} from "../types";

export function useSavingsGoals() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = trpc.savings.list.useQuery({ page, pageSize });

  return {
    savingsGoals: data?.data || [],
    pagination: data?.pagination,
    page,
    setPage,
    isLoading
  };
}

export function useSavingsGoalById(id: string) {
  return trpc.savings.getById.useQuery(
    { id },
    { enabled: !!id }
  );
}

export function useCreateSavingsGoal() {
  const utils = trpc.useUtils();

  return trpc.savings.create.useMutation({
    onSuccess: () => {
      utils.savings.list.invalidate();
    },
  });
}

export function useUpdateSavingsGoal() {
  const utils = trpc.useUtils();

  return trpc.savings.update.useMutation({
    onSuccess: () => {
      utils.savings.list.invalidate();
    },
  });
}

export function useDeleteSavingsGoal() {
  const utils = trpc.useUtils();

  return trpc.savings.delete.useMutation({
    onSuccess: () => {
      utils.savings.list.invalidate();
    },
  });
}

export function useAddFunds() {
  const utils = trpc.useUtils();

  return trpc.savings.addFunds.useMutation({
    onSuccess: () => {
      utils.savings.list.invalidate();
    },
  });
}
