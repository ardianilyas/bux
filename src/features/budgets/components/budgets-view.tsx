"use client";

import { trpc } from "@/trpc/client";
import { PLAN_LIMITS, PLAN_TYPES } from "@/features/billing/lib/billing-constants";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
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
  getMonthlySpending,
} from "@/features/budgets";
import { PaginationControl } from "@/components/ui/pagination-control";
import { useBudgetManagement } from "../hooks/use-budget-management";
import { useSession } from "@/features/auth/hooks/use-auth";

export function BudgetsView() {
  const { data: session } = useSession();
  const router = useRouter();
  const userBaseCurrency = (session?.user as any)?.currency || "IDR";

  const { data: subscription } = trpc.billing.getStatus.useQuery();
  const isPro = subscription?.plan === PLAN_TYPES.PRO;
  const maxBudgets = isPro ? PLAN_LIMITS.pro.maxBudgets : PLAN_LIMITS.free.maxBudgets;
  // Calculate limits after fetching data

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Budgets</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={(e) => {
                if (!isPro && (budgets?.length || 0) >= maxBudgets) {
                  e.preventDefault();
                  toast.error("Free plan is limited to 3 budgets", {
                    action: {
                      label: "Upgrade",
                      onClick: () => router.push("/dashboard/billing"),
                    },
                  });
                  return;
                }
                resetForm();
              }}
              disabled={(!availableCategories || availableCategories.length === 0)}
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

      {
        isOverLimit && (
          <Alert variant="warning" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Plan Limit Exceeded</AlertTitle>
            <AlertDescription>
              You have {budgets?.length} active budgets, but the Free plan only allows {maxBudgets}.
              Please <span className="font-semibold underline cursor-pointer" onClick={() => router.push('/dashboard/billing')}>upgrade to Pro</span> to create more, or delete unused budgets to restore creation access.
            </AlertDescription>
          </Alert>
        )
      }

      {
        !hasCategories || !hasBudgets ? (
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
        )
      }

      {
        pagination && (
          <div className="flex justify-end mt-4">
            <PaginationControl
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )
      }

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
    </div >
  );
}
