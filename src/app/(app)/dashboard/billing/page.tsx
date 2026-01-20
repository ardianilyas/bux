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
  Zap,
  TrendingUp,
  Shield,
  Star,
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
    <div className="space-y-8 max-w-6xl">
      {/* Header with gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-purple-600">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Billing & Subscription
            </h1>
          </div>
          <p className="text-muted-foreground ml-14">Manage your plan and unlock premium features</p>
        </div>
      </div>

      {/* Current Plan Status with enhanced design */}
      <Card className="border-2 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-lg",
              status?.isPro
                ? "bg-gradient-to-br from-yellow-400 to-amber-600"
                : "bg-gradient-to-br from-gray-400 to-gray-600"
            )}>
              <Crown className="h-5 w-5 text-white" />
            </div>
            Current Plan
          </CardTitle>
          <CardDescription>
            {status?.isPro ? "You're enjoying all premium features" : "You're on the Free plan"}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm",
                  status?.isPro
                    ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-white"
                    : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 dark:from-gray-700 dark:to-gray-800 dark:text-gray-200"
                )}>
                  {status?.isPro ? "🌟 Pro" : "Free"}
                </span>
                {status?.isTrialActive && (
                  <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold shadow-sm flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Trial Active
                  </span>
                )}
              </div>

              {(status?.planExpiresAt || status?.trialEndsAt) && (
                <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg w-fit">
                  <Calendar className="h-4 w-4 text-primary" />
                  {status?.isTrialActive
                    ? `Trial ends: ${formatDate(status.trialEndsAt)}`
                    : `Renews: ${formatDate(status.planExpiresAt)}`}
                </p>
              )}
            </div>

            {!status?.isPro && (
              <Button
                onClick={handleStartPayment}
                disabled={createPayment.isPending}
                size="lg"
              >
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
          <Card className="border-2 hover:border-muted-foreground/20 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-lg bg-gradient-to-br from-gray-400 to-gray-600">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <CardTitle>Free</CardTitle>
              </div>
              <CardDescription>Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-6 bg-gradient-to-r from-gray-600 to-gray-800 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
                Gratis
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="p-1 rounded bg-green-500/10">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  Unlimited expenses
                </li>
                <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="p-1 rounded bg-green-500/10">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  {PLAN_LIMITS[PLAN_TYPES.FREE].maxBudgets} budgets
                </li>
                <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="p-1 rounded bg-green-500/10">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  {PLAN_LIMITS[PLAN_TYPES.FREE].maxSavingsGoals} savings goal
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Pro Plan Card - Enhanced */}
          <Card className="border-2 border-primary shadow-xl shadow-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-400/20 to-transparent rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full blur-2xl" />

            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 shadow-lg shadow-yellow-500/25">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                    Pro
                  </CardTitle>
                </div>
                {status?.canStartTrial && (
                  <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full font-semibold shadow-sm flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    7-day trial
                  </span>
                )}
              </div>
              <CardDescription>Unlock the full power of Bux</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              {/* Billing Toggle */}
              <div className="flex gap-2 mb-4 p-1 bg-muted rounded-lg">
                <button
                  onClick={() => setBillingPeriod(BILLING_PERIODS.MONTHLY)}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all",
                    billingPeriod === BILLING_PERIODS.MONTHLY
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod(BILLING_PERIODS.YEARLY)}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all relative",
                    billingPeriod === BILLING_PERIODS.YEARLY
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Yearly
                  <span className="ml-1 text-xs bg-green-500/20 text-green-600 px-1.5 py-0.5 rounded">-17%</span>
                </button>
              </div>

              <div className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {formatPrice(proPrice)}
                <span className="text-base font-normal text-muted-foreground">
                  /{billingPeriod === BILLING_PERIODS.MONTHLY ? "mo" : "yr"}
                </span>
              </div>

              <ul className="space-y-3 text-sm mb-6">
                <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                  <div className="p-1 rounded bg-primary/10">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">Unlimited budgets</span>
                </li>
                <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                  <div className="p-1 rounded bg-primary/10">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">Unlimited savings goals</span>
                </li>
                <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-500/5 transition-colors">
                  <div className="p-1 rounded bg-purple-500/10">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="font-medium">AI-powered receipt scanning</span>
                </li>
                <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-500/5 transition-colors">
                  <div className="p-1 rounded bg-blue-500/10">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium">Advanced analytics & insights</span>
                </li>
                <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-500/5 transition-colors">
                  <div className="p-1 rounded bg-green-500/10">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-medium">Data export capabilities</span>
                </li>
              </ul>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  size="lg"
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
                    size="lg"
                    onClick={handleStartTrial}
                    disabled={startTrial.isPending}
                  >
                    <Star className="h-4 w-4 mr-2 text-yellow-500" />
                    {startTrial.isPending ? "Starting..." : "Start 7-Day Free Trial"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}



      {/* Payment History */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Your recent payment transactions</CardDescription>
            </div>
          </div>
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
      <div className="text-center py-12">
        <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-4">
          <CreditCard className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">No payment history yet</p>
        <p className="text-sm text-muted-foreground/70 mt-1">Your transactions will appear here</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2">
            <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Date</th>
            <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Type</th>
            <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Amount</th>
            <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Status</th>
            <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Reference</th>
          </tr>
        </thead>
        <tbody>
          {paymentHistory.map((payment) => (
            <tr key={payment.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
              <td className="py-4 px-3 font-medium">
                {new Date(payment.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="py-4 px-3">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                  {payment.channelCode || payment.type}
                </span>
              </td>
              <td className="py-4 px-3 font-bold">
                {formatPrice(payment.amount)}
              </td>
              <td className="py-4 px-3">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold border",
                    payment.status === "SUCCEEDED"
                      ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                      : payment.status === "FAILED"
                        ? "bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                        : "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
                  )}
                >
                  {payment.status}
                </span>
              </td>
              <td className="py-4 px-3 text-muted-foreground text-xs max-w-[200px] truncate font-mono">
                {payment.referenceId}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
