"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import {
  ExpenseForm,
  ExpenseFiltersCard,
  ExpenseTable,
} from "@/features/expenses";
import { ReceiptUpload } from "@/features/receipts";
import { useExpenseManagement } from "../hooks/use-expense-management";

export function ExpensesView() {
  const {
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
  } = useExpenseManagement();

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
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCsv}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Export CSV
          </Button>
          <ReceiptUpload />
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
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
      </div>

      <ExpenseFiltersCard
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
      />

      <ExpenseTable
        expenses={expenses || []}
        onEdit={openEditDialog}
        onDelete={setDeletingId}
        isDeleting={deleteMutation.isPending}
      />

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
