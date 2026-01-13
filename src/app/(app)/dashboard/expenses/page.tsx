"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Expense = {
  id: string;
  amount: number;
  description: string;
  date: Date;
  categoryId: string | null;
  category: { id: string; name: string; color: string } | null;
};

type ExpenseFormProps = {
  onSubmit: () => void;
  isLoading: boolean;
  submitLabel: string;
  formData: {
    description: string;
    amount: string;
    date: string;
    categoryId: string;
  };
  setFormData: (data: {
    description: string;
    amount: string;
    date: string;
    categoryId: string;
  }) => void;
  onCancel: () => void;
  categories?: { id: string; name: string; color: string }[];
};

const ExpenseForm = ({
  onSubmit,
  isLoading,
  submitLabel,
  formData,
  setFormData,
  onCancel,
  categories,
}: ExpenseFormProps) => (
  <div className="space-y-4 pt-4">
    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Input
        id="description"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        placeholder="e.g. Coffee, Groceries, Rent"
        autoFocus
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
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="0.00"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        />
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="category">Category</Label>
      <Select
        value={formData.categoryId}
        onValueChange={(value) =>
          setFormData({
            ...formData,
            categoryId: value === "none" ? "" : value,
          })
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
      <Button
        onClick={onSubmit}
        disabled={isLoading}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
      >
        {isLoading ? "Saving..." : submitLabel}
      </Button>
    </div>
  </div>
);

import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";

export default function ExpensesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    categoryId: "",
  });

  const utils = trpc.useUtils();
  const { data: expenses, isLoading: expensesLoading } =
    trpc.expense.list.useQuery();
  const { data: categories } = trpc.category.list.useQuery();

  const createMutation = trpc.expense.create.useMutation({
    onSuccess: () => {
      toast.success("Expense created successfully");
      utils.expense.list.invalidate();
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create expense");
    },
  });

  const updateMutation = trpc.expense.update.useMutation({
    onSuccess: () => {
      toast.success("Expense updated successfully");
      utils.expense.list.invalidate();
      setEditingExpense(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update expense");
    },
  });

  const deleteMutation = trpc.expense.delete.useMutation({
    onSuccess: () => {
      toast.success("Expense deleted successfully");
      utils.expense.list.invalidate();
      setDeletingId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete expense");
    },
  });

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
    createMutation.mutate({
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date),
      categoryId: formData.categoryId || undefined,
    });
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
    updateMutation.mutate({
      id: editingExpense.id,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date),
      categoryId: formData.categoryId || null,
    });
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteMutation.mutate({ id: deletingId });
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  if (expensesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
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
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            <ExpenseForm
              onSubmit={handleCreate}
              isLoading={createMutation.isPending}
              submitLabel="Create"
              formData={formData}
              setFormData={setFormData}
              onCancel={() => {
                setIsCreateOpen(false);
                setEditingExpense(null);
              }}
              categories={categories}
            />
          </DialogContent>
        </Dialog>
      </div>

      {expenses?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground mb-4"
            >
              <line x1="12" x2="12" y1="2" y2="22" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <p className="text-muted-foreground text-lg">No expenses yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Start tracking your expenses by adding your first one
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses?.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium text-foreground">
                      {expense.description}
                    </TableCell>
                    <TableCell>
                      {expense.category ? (
                        <Badge
                          variant="secondary"
                          className="font-normal"
                          style={{
                            backgroundColor: `${expense.category.color}20`,
                            color: expense.category.color,
                            borderColor: expense.category.color,
                          }}
                        >
                          {expense.category.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(expense.date)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(expense)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => setDeletingId(expense.id)}
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={editingExpense !== null}
        onOpenChange={(open) => !open && setEditingExpense(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            onSubmit={handleUpdate}
            isLoading={updateMutation.isPending}
            submitLabel="Save Changes"
            formData={formData}
            setFormData={setFormData}
            onCancel={() => {
              setEditingExpense(null);
            }}
            categories={categories}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
