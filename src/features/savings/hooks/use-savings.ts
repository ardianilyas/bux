"use client";

import { trpc } from "@/trpc/client";
import type {
  SavingsGoal,
  CreateSavingsGoalInput,
  UpdateSavingsGoalInput,
} from "../types";

export function useSavingsGoals() {
  return trpc.savings.list.useQuery();
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
