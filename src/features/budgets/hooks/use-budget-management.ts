import { useState } from "react";
import { toast } from "sonner";
import {
  useBudgets,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
  type Budget,
  type BudgetFormData,
} from "@/features/budgets";
import { useCategories } from "@/features/categories";
import { useExpenses } from "@/features/expenses";

export function useBudgetManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BudgetFormData>({
    categoryId: "",
    amount: "",
  });

  const { budgets, pagination, page, setPage, isLoading: budgetsLoading } = useBudgets();
  const { data: categories } = useCategories();
  // Fetch more expenses for budget calculation client-side
  const { data: expensesData } = useExpenses({
    search: "",
    categoryId: "all",
    startDate: "",
    endDate: "",
    pageSize: 1000,
  });
  const expenses = expensesData?.data || [];

  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const deleteMutation = useDeleteBudget();

  const resetForm = () => {
    setFormData({ categoryId: "", amount: "" });
  };

  const handleCreate = () => {
    if (!formData.categoryId) {
      toast.error("Category is required");
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Valid amount is required");
      return;
    }
    createMutation.mutate(
      {
        categoryId: formData.categoryId,
        amount: parseFloat(formData.amount),
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          resetForm();
        },
      }
    );
  };

  const handleUpdate = () => {
    if (!editingBudget) return;
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Valid amount is required");
      return;
    }
    updateMutation.mutate(
      {
        id: editingBudget.id,
        amount: parseFloat(formData.amount),
      },
      {
        onSuccess: () => {
          setEditingBudget(null);
        },
      }
    );
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(
        { id: deletingId },
        {
          onSuccess: () => {
            setDeletingId(null);
          },
        }
      );
    }
  };

  const openEditDialog = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      categoryId: budget.categoryId,
      amount: budget.amount.toString(),
    });
  };

  // Get categories that don't have budgets yet
  const availableCategories = categories?.filter(
    (cat) => !budgets?.some((b) => b.categoryId === cat.id)
  );

  const hasCategories = categories && categories.length > 0;
  const hasBudgets = budgets && budgets.length > 0;

  return {
    budgets,
    pagination,
    page,
    setPage,
    budgetsLoading,
    categories,
    expenses,
    isCreateOpen,
    setIsCreateOpen,
    editingBudget,
    setEditingBudget,
    deletingId,
    setDeletingId,
    formData,
    setFormData,
    availableCategories,
    hasCategories,
    hasBudgets,
    createMutation,
    updateMutation,
    deleteMutation,
    handleCreate,
    handleUpdate,
    handleDelete,
    openEditDialog,
    resetForm,
  };
}
