import { useState } from "react";
import { toast } from "sonner";
import {
  useExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
  type Expense,
  type ExpenseFormData,
  type ExpenseFilters,
} from "@/features/expenses";
import { useCategories } from "@/features/categories";

export function useExpenseManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    categoryId: "",
  });

  const [filters, setFilters] = useState<ExpenseFilters>({
    search: "",
    categoryId: "all",
    startDate: "",
    endDate: "",
  });

  const { data: expenses, isLoading: expensesLoading } = useExpenses(filters);
  const { data: categories } = useCategories();

  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  const resetForm = () => {
    setFormData({
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      categoryId: "",
    });
  };

  const handleCreate = () => {
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Valid amount is required");
      return;
    }
    createMutation.mutate(
      {
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date),
        categoryId: formData.categoryId || undefined,
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
    if (!editingExpense) return;
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Valid amount is required");
      return;
    }
    updateMutation.mutate(
      {
        id: editingExpense.id,
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date),
        categoryId: formData.categoryId || null,
      },
      {
        onSuccess: () => {
          setEditingExpense(null);
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

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      date: new Date(expense.date).toISOString().split("T")[0],
      categoryId: expense.categoryId || "",
    });
  };

  const handleExportCsv = () => {
    if (!expenses) return;
    const csvContent = [
      ["Date", "Description", "Category", "Amount"],
      ...expenses.map((e) => [
        new Date(e.date).toLocaleDateString(),
        `"${e.description.replace(/"/g, '""')}"`,
        e.category?.name || "Uncategorized",
        e.amount.toFixed(2),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return {
    expenses,
    expensesLoading,
    categories,
    filters,
    setFilters,
    isCreateOpen,
    setIsCreateOpen,
    editingExpense,
    setEditingExpense,
    deletingId,
    setDeletingId,
    formData,
    setFormData,
    createMutation,
    updateMutation,
    deleteMutation,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleExportCsv,
    openEditDialog,
    resetForm,
  };
}
