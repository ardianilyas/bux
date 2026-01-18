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
import { PaginationControl } from "@/components/ui/pagination-control";
import { Plus, Download, Receipt } from "lucide-react";
import { FloatingActionButton } from "@/components/floating-action-button";

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
    pagination,
    page,
    setPage,
  } = useExpenseManagement();

  if (expensesLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasExpenses = expenses && expenses.length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground">
            Track and manage all your spending
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              {pagination?.total
                ? `${pagination.total} expense${pagination.total !== 1 ? "s" : ""}`
                : hasExpenses
                  ? `${expenses.length} expense${expenses.length !== 1 ? "s" : ""}`
                  : "No expenses yet"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <ReceiptUpload />
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Expense</span>
                  <span className="sm:hidden">Add</span>
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
      </div>

      {/* Filters */}
      <ExpenseFiltersCard
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
      />

      {/* Table/Cards */}
      <ExpenseTable
        expenses={expenses || []}
        onEdit={openEditDialog}
        onDelete={setDeletingId}
        isDeleting={deleteMutation.isPending}
        onAddExpense={() => {
          resetForm();
          setIsCreateOpen(true);
        }}
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

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center sm:justify-end mt-4">
          <PaginationControl
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Mobile Quick Add FAB */}
      <FloatingActionButton
        onClick={() => {
          resetForm();
          setIsCreateOpen(true);
        }}
      />
    </div>
  );
}
