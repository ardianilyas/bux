"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { createSubscriptionSchema } from "@/lib/validations/subscription";

type BillingCycle = "weekly" | "monthly" | "yearly";

export function useSubscription() {
  // Create Form State
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [nextBillingDate, setNextBillingDate] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [createExpense, setCreateExpense] = useState(false);

  // Edit Form State
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editBillingCycle, setEditBillingCycle] = useState<BillingCycle>("monthly");
  const [editNextBillingDate, setEditNextBillingDate] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<string | undefined>();

  // Delete State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Queries
  const { data: subscriptions, isLoading } = trpc.subscription.list.useQuery();
  const { data: categories } = trpc.category.list.useQuery();
  const utils = trpc.useUtils();

  // Mutations
  const createMutation = trpc.subscription.create.useMutation({
    onSuccess: () => {
      toast.success("Subscription added");
      utils.subscription.list.invalidate();
      if (createExpense) {
        utils.expense.list.invalidate();
      }
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.subscription.update.useMutation({
    onSuccess: () => {
      toast.success("Subscription updated");
      utils.subscription.list.invalidate();
      setEditOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleMutation = trpc.subscription.update.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      utils.subscription.list.invalidate();
    },
  });

  const deleteMutation = trpc.subscription.delete.useMutation({
    onSuccess: () => {
      toast.success("Subscription deleted");
      utils.subscription.list.invalidate();
      setDeleteOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Handlers
  const resetForm = () => {
    setName("");
    setAmount("");
    setBillingCycle("monthly");
    setNextBillingDate("");
    setCategoryId(undefined);
    setCreateExpense(false);
  };

  const handleCreate = () => {
    // Basic pre-validation
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error("Amount must be a positive number");
      return;
    }
    if (!nextBillingDate) {
      toast.error("Next billing date is required");
      return;
    }

    const payload = {
      name,
      amount: parseFloat(amount),
      billingCycle,
      nextBillingDate: new Date(nextBillingDate),
      categoryId: categoryId || undefined,
      createExpense,
    };

    // Safe parse to catch any other issues before sending
    const validation = createSubscriptionSchema.safeParse(payload);

    if (!validation.success) {
      const error = validation.error.issues[0];
      toast.error(error.message);
      return;
    }

    createMutation.mutate(payload);
  };

  const handleEditOpen = (sub: any) => {
    setEditingId(sub.id);
    setEditName(sub.name);
    setEditAmount(sub.amount.toString());
    setEditBillingCycle(sub.billingCycle);
    setEditNextBillingDate(new Date(sub.nextBillingDate).toISOString().split('T')[0]);
    setEditCategoryId(sub.categoryId || undefined);
    setEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editingId || !editName || !editAmount || !editNextBillingDate) return;
    updateMutation.mutate({
      id: editingId,
      name: editName,
      amount: parseFloat(editAmount),
      billingCycle: editBillingCycle,
      nextBillingDate: new Date(editNextBillingDate),
      categoryId: editCategoryId,
    });
  };

  const handleToggle = (id: string, isActive: boolean) => {
    toggleMutation.mutate({ id, isActive });
  };

  const handleDeleteOpen = (id: string) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!deletingId) return;
    deleteMutation.mutate({ id: deletingId });
  };

  // Computed
  const totalMonthly = subscriptions
    ?.filter((s) => s.isActive)
    .reduce((sum, s) => {
      if (s.billingCycle === "weekly") return sum + s.amount * 4;
      if (s.billingCycle === "yearly") return sum + s.amount / 12;
      return sum + s.amount;
    }, 0) || 0;

  return {
    // Data
    subscriptions,
    categories,
    isLoading,
    totalMonthly,

    // Create Form
    isOpen,
    setIsOpen,
    name,
    setName,
    amount,
    setAmount,
    billingCycle,
    setBillingCycle,
    nextBillingDate,
    setNextBillingDate,
    categoryId,
    setCategoryId,
    createExpense,
    setCreateExpense,
    handleCreate,
    isCreating: createMutation.isPending,

    // Edit Form
    editOpen,
    setEditOpen,
    editName,
    setEditName,
    editAmount,
    setEditAmount,
    editBillingCycle,
    setEditBillingCycle,
    editNextBillingDate,
    setEditNextBillingDate,
    editCategoryId,
    setEditCategoryId,
    handleEditOpen,
    handleUpdate,
    isUpdating: updateMutation.isPending,

    // Toggle
    handleToggle,

    // Delete
    deleteOpen,
    setDeleteOpen,
    handleDeleteOpen,
    handleDelete,
    isDeleting: deleteMutation.isPending,
  };
}

export type BillingCycleType = BillingCycle;
