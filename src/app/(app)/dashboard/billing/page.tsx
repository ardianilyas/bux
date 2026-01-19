"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  Crown,
  Loader2,
  Sparkles,
  Calendar,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import {
  PLAN_TYPES,
  PLAN_PRICING,
  PLAN_LIMITS,
  BILLING_PERIODS,
  BILLING_SUCCESS,
  type BillingPeriod,
} from "@/features/billing/lib/billing-constants";

// ==================== Helper ====================

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

// ==================== Component ====================

export default function BillingPage() {
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();
  const autoOpenUpgrade = searchParams.get("plan") === "pro";
  const paymentStatus = searchParams.get("payment_status");

  useEffect(() => {
    if (paymentStatus === "success") {
      toast.success(BILLING_SUCCESS.SUBSCRIPTION_ACTIVATED);
      utils.billing.getStatus.invalidate();
      // Optional: Clear param from URL
    } else if (paymentStatus === "failed") {
      toast.error("Payment failed or cancelled");
    }
  }, [paymentStatus, utils.billing.getStatus]);

  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(BILLING_PERIODS.MONTHLY);

  const { data: status, isLoading } = trpc.billing.getStatus.useQuery();

  const startTrial = trpc.billing.startTrial.useMutation({
    onSuccess: () => {
      toast.success(BILLING_SUCCESS.TRIAL_STARTED);
      utils.billing.getStatus.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createPayment = trpc.billing.createPayment.useMutation({
    onSuccess: (data) => {
      // Redirect to Xendit Invoice
      if (data.invoiceUrl) {
        window.location.href = data.invoiceUrl;
      } else {
        toast.error("Failed to generate payment link");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });



  // Auto-open upgrade flow if redirected from landing
  useEffect(() => {
    if (autoOpenUpgrade && status && !status.isPro) {
      handleStartPayment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenUpgrade, status?.isPro]);

  const handleStartTrial = () => {
    startTrial.mutate();
  };

  const handleStartPayment = () => {
    createPayment.mutate({ billingPeriod });
  };

  const proPrice = PLAN_PRICING[PLAN_TYPES.PRO][billingPeriod];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-1">Manage your plan and payment</p>
      </div>

      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className={cn("h-5 w-5", status?.isPro ? "text-yellow-500" : "text-muted-foreground")} />
            Current Plan
          </CardTitle>
          <CardDescription>
            {status?.isPro ? "You're on the Pro plan" : "You're on the Free plan"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  status?.isPro
                    ? "bg-yellow-500/10 text-yellow-600"
                    : "bg-muted text-muted-foreground"
                )}>
                  {status?.isPro ? "Pro" : "Free"}
                </span>
                {status?.isTrialActive && (
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium">
                    Trial Active
                  </span>
                )}
              </div>

              {(status?.planExpiresAt || status?.trialEndsAt) && (
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {status?.isTrialActive
                    ? `Trial ends: ${formatDate(status.trialEndsAt)}`
                    : `Renews: ${formatDate(status.planExpiresAt)}`}
                </p>
              )}
            </div>

            {!status?.isPro && (
              <Button onClick={handleStartPayment} disabled={createPayment.isPending}>
                {createPayment.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison (only show if not Pro) */}
      {!status?.isPro && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Plan Card */}
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Basic expense tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-6">Gratis</div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Unlimited expenses
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  {PLAN_LIMITS[PLAN_TYPES.FREE].maxBudgets} budgets
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  {PLAN_LIMITS[PLAN_TYPES.FREE].maxSavingsGoals} savings goal
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Pro Plan Card */}
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Pro
                </CardTitle>
                {status?.canStartTrial && (
                  <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full">
                    7-day trial available
                  </span>
                )}
              </div>
              <CardDescription>Full power budgeting</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Billing Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setBillingPeriod(BILLING_PERIODS.MONTHLY)}
                  className={cn(
                    "px-3 py-1 rounded-md text-sm",
                    billingPeriod === BILLING_PERIODS.MONTHLY
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod(BILLING_PERIODS.YEARLY)}
                  className={cn(
                    "px-3 py-1 rounded-md text-sm",
                    billingPeriod === BILLING_PERIODS.YEARLY
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  Yearly (-17%)
                </button>
              </div>

              <div className="text-3xl font-bold mb-6">
                {formatPrice(proPrice)}
                <span className="text-base font-normal text-muted-foreground">
                  /{billingPeriod === BILLING_PERIODS.MONTHLY ? "mo" : "yr"}
                </span>
              </div>

              <ul className="space-y-3 text-sm mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Unlimited budgets
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Unlimited savings goals
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Receipt scanning
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Advanced analytics
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Data export
                </li>
              </ul>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={handleStartPayment}
                  disabled={createPayment.isPending}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {createPayment.isPending ? "Preparing..." : "Pay with QRIS"}
                </Button>

                {status?.canStartTrial && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleStartTrial}
                    disabled={startTrial.isPending}
                  >
                    {startTrial.isPending ? "Starting..." : "Start 7-Day Free Trial"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}



      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>Your recent payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentHistoryTable />
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== Payment History Table ====================

function PaymentHistoryTable() {
  const { data: paymentHistory, isLoading } = trpc.billing.getPaymentHistory.useQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!paymentHistory || paymentHistory.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No payment history yet
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-2 font-medium">Date</th>
            <th className="text-left py-3 px-2 font-medium">Type</th>
            <th className="text-left py-3 px-2 font-medium">Amount</th>
            <th className="text-left py-3 px-2 font-medium">Status</th>
            <th className="text-left py-3 px-2 font-medium">Reference</th>
          </tr>
        </thead>
        <tbody>
          {paymentHistory.map((payment) => (
            <tr key={payment.id} className="border-b last:border-0">
              <td className="py-3 px-2">
                {new Date(payment.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="py-3 px-2">
                <span className="px-2 py-1 rounded-full text-xs bg-muted">
                  {payment.channelCode || payment.type}
                </span>
              </td>
              <td className="py-3 px-2 font-medium">
                {formatPrice(payment.amount)}
              </td>
              <td className="py-3 px-2">
                <span
                  className={cn(
                    "px-2 py-1 rounded-full text-xs",
                    payment.status === "SUCCEEDED"
                      ? "bg-green-500/10 text-green-600"
                      : payment.status === "FAILED"
                        ? "bg-red-500/10 text-red-600"
                        : "bg-yellow-500/10 text-yellow-600"
                  )}
                >
                  {payment.status}
                </span>
              </td>
              <td className="py-3 px-2 text-muted-foreground text-xs max-w-[150px] truncate">
                {payment.referenceId}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
