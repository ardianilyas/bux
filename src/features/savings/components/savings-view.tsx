"use client";

import { trpc } from "@/trpc/client";

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
import { PaginationControl } from "@/components/ui/pagination-control";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/empty-state";
import { Plus, PiggyBank, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { PLAN_LIMITS, PLAN_TYPES } from "@/features/billing/lib/billing-constants";
import { SavingsGoalCard } from "./savings-goal-card";
import { SavingsGoalForm } from "./savings-goal-form";
import { AddFundsDialog } from "./add-funds-dialog";
import {
  useSavingsGoals,
  useCreateSavingsGoal,
  useUpdateSavingsGoal,
  useDeleteSavingsGoal,
  useAddFunds,
  useTogglePinSavingsGoal,
} from "../hooks/use-savings";
import type { SavingsGoal, SavingsGoalFormData } from "../types";
import { useSession } from "@/features/auth/hooks/use-auth";
import { useState } from "react";
import { toast } from "sonner";

export function SavingsView() {
  const { data: session } = useSession();
  const router = useRouter();
  const userBaseCurrency = (session?.user as any)?.currency || "IDR";

  const { data: subscription } = trpc.billing.getStatus.useQuery();
  const isPro = subscription?.plan === PLAN_TYPES.PRO;
  const maxGoals = isPro ? PLAN_LIMITS.pro.maxSavingsGoals : PLAN_LIMITS.free.maxSavingsGoals;
  // Calculate limits after fetching data

  const { savingsGoals, pagination, page, setPage, isLoading } = useSavingsGoals();

  const isOverLimit = !isPro && (savingsGoals?.length || 0) > maxGoals;
  const createMutation = useCreateSavingsGoal();
  const updateMutation = useUpdateSavingsGoal();
  const deleteMutation = useDeleteSavingsGoal();
  const addFundsMutation = useAddFunds();
  const togglePinMutation = useTogglePinSavingsGoal();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addingGoal, setAddingGoal] = useState<SavingsGoal | null>(null);

  const handleCreate = (data: SavingsGoalFormData) => {
    createMutation.mutate(
      {
        name: data.name,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount || 0,
        color: data.color || "#6366f1",
        targetDate: data.targetDate || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Savings goal created!");
          setIsCreateOpen(false);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create savings goal");
        },
      }
    );
  };

  const handleUpdate = (data: SavingsGoalFormData) => {
    if (!editingGoal) return;

    updateMutation.mutate(
      {
        id: editingGoal.id,
        name: data.name,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount,
        color: data.color,
        targetDate: data.targetDate,
      },
      {
        onSuccess: () => {
          toast.success("Savings goal updated!");
          setEditingGoal(null);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update savings goal");
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deletingId) return;

    deleteMutation.mutate(
      { id: deletingId },
      {
        onSuccess: () => {
          toast.success("Savings goal deleted!");
          setDeletingId(null);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to delete savings goal");
        },
      }
    );
  };

  const handleAddFunds = (amount: number) => {
    if (!addingGoal) return;

    addFundsMutation.mutate(
      { id: addingGoal.id, amount },
      {
        onSuccess: () => {
          toast.success(`Added ${amount.toLocaleString()} to ${addingGoal.name}!`);
          setAddingGoal(null);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to add funds");
        },
      }
    );
  };

  const handleTogglePin = (goal: SavingsGoal) => {
    togglePinMutation.mutate(
      { id: goal.id },
      {
        onSuccess: () => {
          const action = goal.isPinned ? "unpinned from" : "pinned to";
          toast.success(`${goal.name} ${action} dashboard!`);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update pin status");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Savings Goals</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-24 w-24 rounded-full" />
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

  const hasGoals = savingsGoals && savingsGoals.length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Savings Goals</h1>
        <p className="text-muted-foreground">
          Track your financial goals and watch your savings grow
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            {hasGoals ? `${savingsGoals.length} active goal${savingsGoals.length !== 1 ? 's' : ''}` : 'Get started by creating your first goal'}
          </span>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={(e) => {
                if (!isPro && (savingsGoals?.length || 0) >= maxGoals) {
                  e.preventDefault();
                  toast.error("Free plan is limited to 1 savings goal", {
                    action: {
                      label: "Upgrade",
                      onClick: () => router.push("/dashboard/billing"),
                    },
                  });
                }
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Savings Goal</DialogTitle>
            </DialogHeader>
            <SavingsGoalForm
              onSubmit={handleCreate}
              isLoading={createMutation.isPending}
              submitLabel="Create"
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {
        isOverLimit && (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Plan Limit Exceeded</AlertTitle>
            <AlertDescription>
              You have {savingsGoals?.length} active savings goals, but the Free plan only allows {maxGoals}.
              Please <span className="font-semibold underline cursor-pointer" onClick={() => router.push('/dashboard/billing')}>upgrade to Pro</span> to create more, or delete unused goals to restore creation access.
            </AlertDescription>
          </Alert>
        )
      }

      {
        !hasGoals ? (
          <EmptyState
            icon={PiggyBank}
            title="No savings goals yet"
            description="Create your first savings goal to start tracking your progress toward financial freedom"
            action={
              <Button
                onClick={() => {
                  if (!isPro && (savingsGoals?.length || 0) >= maxGoals) {
                    toast.error("Free plan is limited to 1 savings goal", {
                      action: {
                        label: "Upgrade",
                        onClick: () => router.push("/dashboard/billing"),
                      },
                    });
                    return;
                  }
                  setIsCreateOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Goal
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savingsGoals?.map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                onEdit={setEditingGoal}
                onDelete={setDeletingId}
                onAddFunds={setAddingGoal}
                onTogglePin={handleTogglePin}
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
        open={editingGoal !== null}
        onOpenChange={(open) => !open && setEditingGoal(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Savings Goal</DialogTitle>
          </DialogHeader>
          <SavingsGoalForm
            onSubmit={handleUpdate}
            isLoading={updateMutation.isPending}
            submitLabel="Save Changes"
            onCancel={() => setEditingGoal(null)}
            editingGoal={editingGoal}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Savings Goal"
        description="Are you sure you want to delete this savings goal? This action cannot be undone."
        isDeleting={deleteMutation.isPending}
      />

      <AddFundsDialog
        open={addingGoal !== null}
        onOpenChange={(open) => !open && setAddingGoal(null)}
        goal={addingGoal}
        onAddFunds={handleAddFunds}
        isLoading={addFundsMutation.isPending}
        userBaseCurrency={userBaseCurrency}
      />
    </div >
  );
}
