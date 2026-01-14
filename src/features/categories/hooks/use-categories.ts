"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";

export function useCategories() {
  return trpc.category.list.useQuery();
}

export function useCategoryById(id: string) {
  return trpc.category.getById.useQuery({ id });
}

export function useCreateCategory() {
  const utils = trpc.useUtils();

  return trpc.category.create.useMutation({
    onSuccess: () => {
      toast.success("Category created successfully");
      utils.category.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create category");
    },
  });
}

export function useUpdateCategory() {
  const utils = trpc.useUtils();

  return trpc.category.update.useMutation({
    onSuccess: () => {
      toast.success("Category updated successfully");
      utils.category.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update category");
    },
  });
}

export function useDeleteCategory() {
  const utils = trpc.useUtils();

  return trpc.category.delete.useMutation({
    onSuccess: () => {
      toast.success("Category deleted successfully");
      utils.category.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete category");
    },
  });
}
