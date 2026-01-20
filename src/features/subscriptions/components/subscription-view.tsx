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
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Pencil,
  Trash2,
  PlayCircle,
  Plus,
  RefreshCw,
  Calendar,
  CreditCard,
  Bell
} from "lucide-react";
import { PaginationControl } from "@/components/ui/pagination-control";
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
    pagination,
    page,
    setPage,
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
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Skeleton Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-teal-500/5 rounded-3xl blur-3xl" />
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
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-teal-500/5 rounded-3xl blur-3xl" />
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/25">
                  <RefreshCw className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Subscriptions
                </h1>
              </div>
              <p className="text-muted-foreground ml-14">
                Track your recurring payments and subscriptions
              </p>
            </div>

            {/* Monthly Total Card */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Monthly Total</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(totalMonthly)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <Button
          variant="outline"
          onClick={handleProcessRecurring}
          disabled={isProcessing}
          className="gap-2"
        >
          <PlayCircle className="h-4 w-4" />
          {isProcessing ? "Processing..." : "Process Due"}
        </Button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/25">
              <Plus className="h-4 w-4" />
              Add Subscription
            </Button>
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
                <DatePicker
                  id="nextBilling"
                  date={nextBillingDate ? new Date(nextBillingDate) : undefined}
                  setDate={(date) => {
                    setNextBillingDate(date ? format(date, "yyyy-MM-dd") : "");
                  }}
                  className="w-full"
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

      {/* Empty State */}
      {subscriptions?.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/10 to-teal-500/10 flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No subscriptions yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Track your recurring payments like Netflix, Spotify, or gym memberships to stay on top of your expenses.
            </p>
            <Button onClick={() => setIsOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Subscription
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subscriptions?.map((subscription) => {
            const dueStatus = getDueStatus(subscription.nextBillingDate);

            return (
              <Card
                key={subscription.id}
                className={cn(
                  "border-2 transition-all hover:shadow-lg",
                  !subscription.isActive && "opacity-60 hover:opacity-80",
                  dueStatus.status === "overdue" && subscription.isActive && "border-red-500/30 bg-red-500/5",
                  dueStatus.status === "today" && subscription.isActive && "border-orange-500/30 bg-orange-500/5",
                  dueStatus.status === "soon" && subscription.isActive && "border-sky-500/30 bg-sky-500/5"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-semibold">{subscription.name}</CardTitle>
                      <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
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
                    <span className="text-muted-foreground flex items-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5" />
                      Billing
                    </span>
                    <Badge variant="outline" className="font-medium">
                      {getCycleLabel(subscription.billingCycle)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Next payment
                    </span>
                    <Badge
                      variant={dueStatus.variant}
                      className={cn(
                        "font-medium",
                        dueStatus.status === "overdue" && "bg-red-500/10 text-red-600 border-red-500/20",
                        dueStatus.status === "today" && "bg-orange-500/10 text-orange-600 border-orange-500/20",
                        dueStatus.status === "soon" && "bg-sky-500/10 text-sky-600 border-sky-500/20"
                      )}
                    >
                      {dueStatus.label}
                    </Badge>
                  </div>
                  {subscription.category && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Category</span>
                      <Badge
                        style={{
                          backgroundColor: `${subscription.category.color}15`,
                          color: subscription.category.color,
                          borderColor: `${subscription.category.color}30`
                        }}
                        className="border"
                      >
                        {subscription.category.name}
                      </Badge>
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t">
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
                      className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-800/50"
                      onClick={() => handleDeleteOpen(subscription.id)}
                    >
                      <Trash2 className="mr-2 h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
              <DatePicker
                id="edit-nextBilling"
                date={editNextBillingDate ? new Date(editNextBillingDate) : undefined}
                setDate={(date) => {
                  setEditNextBillingDate(date ? format(date, "yyyy-MM-dd") : "");
                }}
                className="w-full"
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
