"use client";

import { trpc } from "@/trpc/client";
import { PLAN_LIMITS, PLAN_TYPES } from "@/features/billing/lib/billing-constants";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Plus, Wallet, Crown, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import {
  BudgetForm,
  BudgetCard,
  BudgetEmptyState,
} from "@/features/budgets";
import { PaginationControl } from "@/components/ui/pagination-control";
import { useBudgetManagement } from "../hooks/use-budget-management";
import { useSession } from "@/features/auth/hooks/use-auth";
import { cn } from "@/lib/utils";

export function BudgetsView() {
  const { data: session } = useSession();
  const router = useRouter();
  const userBaseCurrency = (session?.user as any)?.currency || "IDR";

  const { data: subscription } = trpc.billing.getStatus.useQuery();
  const isPro = subscription?.plan === PLAN_TYPES.PRO;
  const maxBudgets = isPro ? PLAN_LIMITS.pro.maxBudgets : PLAN_LIMITS.free.maxBudgets;

  const {
    budgets,
    pagination,
    page,
    setPage,
    budgetsLoading,
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
  } = useBudgetManagement();

  const isOverLimit = !isPro && (budgets?.length || 0) > maxBudgets;
  const budgetCount = budgets?.length || 0;

  if (budgetsLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Skeleton Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-green-500/5 to-teal-500/5 rounded-3xl blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-9 w-48" />
            </div>
            <Skeleton className="h-5 w-64 ml-14" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-2">
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-green-500/5 to-teal-500/5 rounded-3xl blur-3xl" />
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Budgets
                </h1>
              </div>
              <p className="text-muted-foreground ml-14">
                Set spending limits and track your progress
              </p>
            </div>

            {/* Plan Usage Indicator + Add Button */}
            <div className="flex items-center gap-3">
              {/* Plan Usage Badge */}
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border",
                isPro
                  ? "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                  : "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-gray-300 dark:border-gray-700"
              )}>
                {isPro ? (
                  <>
                    <Crown className="h-4 w-4" />
                    <span>Unlimited</span>
                  </>
                ) : (
                  <>
                    <span className={cn(
                      "font-bold",
                      budgetCount >= maxBudgets ? "text-red-600" : "text-emerald-600 dark:text-emerald-400"
                    )}>
                      {budgetCount}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span>{maxBudgets}</span>
                    <span className="text-muted-foreground">budgets</span>
                  </>
                )}
              </div>

              {/* Add Budget Button */}
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={(e) => {
                      if (!isPro && budgetCount >= maxBudgets) {
                        e.preventDefault();
                        toast.error("Free plan is limited to 3 budgets", {
                          description: "Upgrade to Pro for unlimited budgets",
                          action: {
                            label: "Upgrade",
                            onClick: () => router.push("/dashboard/billing"),
                          },
                        });
                        return;
                      }
                      resetForm();
                    }}
                    disabled={!availableCategories || availableCategories.length === 0}
                    className="gap-2 shadow-lg shadow-primary/25"
                  >
                    <Plus className="h-4 w-4" />
                    Add Budget
                    {!isPro && budgetCount >= maxBudgets && (
                      <Sparkles className="h-3 w-3 text-yellow-400" />
                    )}
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
          </div>
        </div>
      </div>

      {/* Plan Limit Warning */}
      {isOverLimit && (
        <Alert variant="warning" className="border-2 border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-amber-500/5">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertTitle className="text-orange-700 dark:text-orange-400">Plan Limit Exceeded</AlertTitle>
          <AlertDescription className="text-orange-600/80 dark:text-orange-400/80">
            You have {budgets?.length} active budgets, but the Free plan only allows {maxBudgets}.
            Please{" "}
            <button
              className="font-semibold underline hover:no-underline"
              onClick={() => router.push("/dashboard/billing")}
            >
              upgrade to Pro
            </button>{" "}
            to create more, or delete unused budgets to restore creation access.
          </AlertDescription>
        </Alert>
      )}

      {/* Budget Cards */}
      {!hasCategories || !hasBudgets ? (
        <BudgetEmptyState hasCategories={hasCategories ?? false} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets?.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              // @ts-ignore - spent is added by backend aggregation
              spent={budget.spent || 0}
              onEdit={openEditDialog}
              onDelete={setDeletingId}
              isDeleting={deleteMutation.isPending}
              userBaseCurrency={userBaseCurrency}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center sm:justify-end mt-4">
          <PaginationControl
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
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
