"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { toast } from "sonner";
import {
  BudgetForm,
  BudgetCard,
  BudgetEmptyState,
  useBudgets,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
  getMonthlySpending,
  type Budget,
  type BudgetFormData,
} from "@/features/budgets";
import { useCategories } from "@/features/categories";
import { useExpenses } from "@/features/expenses";

export function BudgetsView() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BudgetFormData>({
    categoryId: "",
    amount: "",
  });

  const { data: budgets, isLoading: budgetsLoading } = useBudgets();
  const { data: categories } = useCategories();
  const { data: expenses } = useExpenses();

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

  if (budgetsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Budgets</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const hasCategories = categories && categories.length > 0;
  const hasBudgets = budgets && budgets.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Budgets</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              disabled={!availableCategories || availableCategories.length === 0}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Budget</DialogTitle>
            </DialogHeader>
            <BudgetForm
              onSubmit={handleCreate}
              isLoading={createMutation.isPending}
              submitLabel="Create"
              formData={formData}
              setFormData={setFormData}
              onCancel={() => setIsCreateOpen(false)}
              availableCategories={availableCategories}
            />
          </DialogContent>
        </Dialog>
      </div>

      {!hasCategories || !hasBudgets ? (
        <BudgetEmptyState hasCategories={hasCategories ?? false} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets?.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              spent={getMonthlySpending(expenses, budget.categoryId)}
              onEdit={openEditDialog}
              onDelete={setDeletingId}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={editingBudget !== null}
        onOpenChange={(open) => !open && setEditingBudget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
          </DialogHeader>
          <BudgetForm
            onSubmit={handleUpdate}
            isLoading={updateMutation.isPending}
            submitLabel="Save Changes"
            formData={formData}
            setFormData={setFormData}
            onCancel={() => setEditingBudget(null)}
            editingBudget={editingBudget}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Budget"
        description="Are you sure you want to delete this budget? This action cannot be undone."
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
