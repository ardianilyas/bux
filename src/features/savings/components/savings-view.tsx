"use client";

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
import { SavingsGoalCard, SavingsGoalEmptyState } from "./savings-goal-card";
import { SavingsGoalForm } from "./savings-goal-form";
import { AddFundsDialog } from "./add-funds-dialog";
import {
  useSavingsGoals,
  useCreateSavingsGoal,
  useUpdateSavingsGoal,
  useDeleteSavingsGoal,
  useAddFunds,
} from "../hooks/use-savings";
import type { SavingsGoal, SavingsGoalFormData } from "../types";
import { useSession } from "@/features/auth/hooks/use-auth";
import { useState } from "react";
import { toast } from "sonner";

export function SavingsView() {
  const { data: session } = useSession();
  const userBaseCurrency = (session?.user as any)?.currency || "IDR";

  const { data: savingsGoals, isLoading } = useSavingsGoals();
  const createMutation = useCreateSavingsGoal();
  const updateMutation = useUpdateSavingsGoal();
  const deleteMutation = useDeleteSavingsGoal();
  const addFundsMutation = useAddFunds();

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Savings Goals</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
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

      {!hasGoals ? (
        <SavingsGoalEmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {savingsGoals?.map((goal) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              onEdit={setEditingGoal}
              onDelete={setDeletingId}
              onAddFunds={setAddingGoal}
              isDeleting={deleteMutation.isPending}
              userBaseCurrency={userBaseCurrency}
            />
          ))}
        </div>
      )}

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
    </div>
  );
}
