"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { Pencil, Trash2, PlayCircle } from "lucide-react";
import { useSubscription, type BillingCycleType } from "../hooks/use-subscription";

const getCycleLabel = (cycle: string) => {
  switch (cycle) {
    case "weekly":
      return "Weekly";
    case "monthly":
      return "Monthly";
    case "yearly":
      return "Yearly";
    default:
      return cycle;
  }
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

const getDueStatus = (nextBillingDate: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(nextBillingDate);
  dueDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { status: "overdue", label: `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} overdue`, variant: "destructive" as const };
  if (diffDays === 0) return { status: "today", label: "Due today", variant: "destructive" as const };
  if (diffDays <= 3) return { status: "soon", label: `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`, variant: "secondary" as const };
  return { status: "ok", label: formatDate(nextBillingDate), variant: "outline" as const };
};

export function SubscriptionView() {
  const {
    subscriptions,
    categories,
    isLoading,
    totalMonthly,
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
    isCreating,
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
    isUpdating,
    handleToggle,
    deleteOpen,
    setDeleteOpen,
    handleDeleteOpen,
    handleDelete,
    isDeleting,
    handleProcessRecurring,
    isProcessing,
  } = useSubscription();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
        <p className="text-muted-foreground">
          Total monthly: {formatCurrency(totalMonthly)}
        </p>
      </div>
      <div className="flex gap-2 items-center justify-between">
        <Button
          variant="outline"
          onClick={handleProcessRecurring}
          disabled={isProcessing}
        >
          <PlayCircle className="mr-2 h-4 w-4" />
          {isProcessing ? "Processing..." : "Process Due"}
        </Button>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Add Subscription</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Subscription</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Netflix, Spotify"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Billing Cycle</Label>
                <Select value={billingCycle} onValueChange={(v) => setBillingCycle(v as BillingCycleType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextBilling">Next Billing Date</Label>
                <Input
                  id="nextBilling"
                  type="date"
                  value={nextBillingDate}
                  onChange={(e) => setNextBillingDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Category (optional)</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="createExpense"
                  checked={createExpense}
                  onCheckedChange={(checked) => setCreateExpense(checked as boolean)}
                />
                <Label htmlFor="createExpense" className="font-normal cursor-pointer">
                  Log this payment as an expense now
                </Label>
              </div>

              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={isCreating}
              >
                {isCreating ? "Adding..." : "Add Subscription"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {subscriptions?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No subscriptions yet. Add your first one!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subscriptions?.map((subscription) => (
            <Card key={subscription.id} className={!subscription.isActive ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{subscription.name}</CardTitle>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(subscription.amount)}
                    </p>
                  </div>
                  <Switch
                    checked={subscription.isActive}
                    onCheckedChange={(checked) => handleToggle(subscription.id, checked)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Billing</span>
                  <Badge variant="outline">{getCycleLabel(subscription.billingCycle)}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next payment</span>
                  <span className="text-foreground">{formatDate(subscription.nextBillingDate)}</span>
                </div>
                {subscription.category && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <Badge style={{ backgroundColor: `${subscription.category.color}20`, color: subscription.category.color }}>
                      {subscription.category.name}
                    </Badge>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditOpen(subscription)}
                  >
                    <Pencil className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={() => handleDeleteOpen(subscription.id)}
                  >
                    <Trash2 className="mr-2 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Billing Cycle</Label>
              <Select value={editBillingCycle} onValueChange={(v) => setEditBillingCycle(v as BillingCycleType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-nextBilling">Next Billing Date</Label>
              <Input
                id="edit-nextBilling"
                type="date"
                value={editNextBillingDate}
                onChange={(e) => setEditNextBillingDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Category (optional)</Label>
              <Select value={editCategoryId || "none"} onValueChange={(v) => setEditCategoryId(v === "none" ? undefined : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={handleUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update Subscription"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subscription? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
  