"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

type BillingCycle = "weekly" | "monthly" | "yearly";

export default function SubscriptionsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [nextBillingDate, setNextBillingDate] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();

  const { data: subscriptions, isLoading } = trpc.subscription.list.useQuery();
  const { data: categories } = trpc.category.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.subscription.create.useMutation({
    onSuccess: () => {
      toast.success("Subscription added");
      utils.subscription.list.invalidate();
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleMutation = trpc.subscription.update.useMutation({
    onSuccess: () => {
      toast.success("Subscription updated");
      utils.subscription.list.invalidate();
    },
  });

  const deleteMutation = trpc.subscription.delete.useMutation({
    onSuccess: () => {
      toast.success("Subscription deleted");
      utils.subscription.list.invalidate();
    },
  });

  const resetForm = () => {
    setName("");
    setAmount("");
    setBillingCycle("monthly");
    setNextBillingDate("");
    setCategoryId(undefined);
  };

  const handleCreate = () => {
    if (!name || !amount || !nextBillingDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    createMutation.mutate({
      name,
      amount: parseFloat(amount),
      billingCycle,
      nextBillingDate: new Date(nextBillingDate),
      categoryId,
    });
  };

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

  const totalMonthly = subscriptions
    ?.filter((s) => s.isActive)
    .reduce((sum, s) => {
      if (s.billingCycle === "weekly") return sum + s.amount * 4;
      if (s.billingCycle === "yearly") return sum + s.amount / 12;
      return sum + s.amount;
    }, 0) || 0;

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
          <p className="text-muted-foreground">
            Total monthly: {formatCurrency(totalMonthly)}
          </p>
        </div>
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
                <Select value={billingCycle} onValueChange={(v) => setBillingCycle(v as BillingCycle)}>
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
              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Adding..." : "Add Subscription"}
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
                    onCheckedChange={(checked) =>
                      toggleMutation.mutate({ id: subscription.id, isActive: checked })
                    }
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
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-red-500 hover:text-red-600"
                  onClick={() => deleteMutation.mutate({ id: subscription.id })}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
