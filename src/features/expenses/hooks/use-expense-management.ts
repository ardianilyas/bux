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
import { useSession } from "@/features/auth/hooks/use-auth";

export function useExpenseManagement() {
  const { data: session } = useSession();
  const userBaseCurrency = (session?.user as any)?.currency || "IDR";

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    categoryId: "",
    currency: userBaseCurrency,
    exchangeRate: "1",
  });

  const [filters, setFilters] = useState<ExpenseFilters>({
    search: "",
    categoryId: "all",
    startDate: "",
    endDate: "",
  });

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: expensesData, isLoading: expensesLoading } = useExpenses({ ...filters, page, pageSize });
  const expenses = expensesData?.data || [];
  const pagination = expensesData?.pagination;
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
      currency: userBaseCurrency,
      exchangeRate: "1",
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
        currency: formData.currency,
        exchangeRate: parseFloat(formData.exchangeRate),
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
        currency: formData.currency,
        exchangeRate: parseFloat(formData.exchangeRate),
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
      currency: expense.currency || userBaseCurrency,
      exchangeRate: (expense.exchangeRate || 1).toString(),
    });
  };

  const handleExportCsv = () => {
    if (!expenses) return;
    const csvContent = [
      ["Date", "Description", "Category", "Amount", "Currency"],
      ...expenses.map((e) => [
        new Date(e.date).toLocaleDateString(),
        `"${e.description.replace(/"/g, '""')}"`,
        e.category?.name || "Uncategorized",
        e.amount.toFixed(2),
        e.currency || userBaseCurrency,
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
    pagination,
    page,
    setPage,
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
