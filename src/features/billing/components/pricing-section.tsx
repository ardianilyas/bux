"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "@/features/auth";
import {
  PLAN_TYPES,
  PLAN_PRICING,
  PLAN_LIMITS,
  BILLING_PERIODS,
  type BillingPeriod,
} from "../lib/billing-constants";

// ==================== Types ====================

interface PricingFeature {
  text: string;
  included: boolean;
}

// ==================== Feature Lists ====================

const FREE_FEATURES: PricingFeature[] = [
  { text: "Unlimited expense tracking", included: true },
  { text: "Basic 30-day analytics", included: true },
  { text: `Up to ${PLAN_LIMITS[PLAN_TYPES.FREE].maxBudgets} budgets`, included: true },
  { text: `${PLAN_LIMITS[PLAN_TYPES.FREE].maxSavingsGoals} savings goal`, included: true },
  { text: "Receipt scanning", included: false },
  { text: "Data export", included: false },
  { text: "Priority support", included: false },
];

const PRO_FEATURES: PricingFeature[] = [
  { text: "Unlimited expense tracking", included: true },
  { text: "Advanced analytics & trends", included: true },
  { text: "Unlimited budgets", included: true },
  { text: "Unlimited savings goals", included: true },
  { text: "Receipt scanning (OCR)", included: true },
  { text: "CSV/PDF data export", included: true },
  { text: "Priority support", included: true },
];

// ==================== Price Formatter ====================

function formatPrice(amount: number): string {
  return "Rp" + amount.toLocaleString("id-ID");
}

// ==================== Component ====================

export function PricingSection() {
  const router = useRouter();
  const { data: session } = useSession();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(BILLING_PERIODS.MONTHLY);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const proPrice = PLAN_PRICING[PLAN_TYPES.PRO][billingPeriod];
  const monthlyPrice = PLAN_PRICING[PLAN_TYPES.PRO][BILLING_PERIODS.MONTHLY];
  const yearlyDiscount = Math.round(
    (1 - PLAN_PRICING[PLAN_TYPES.PRO][BILLING_PERIODS.YEARLY] / 12 / monthlyPrice) * 100
  );

  const handleSelectPlan = async (plan: string) => {
    if (!session?.user) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/dashboard/billing&plan=${plan}`);
      return;
    }

    setLoadingPlan(plan);

    if (plan === PLAN_TYPES.FREE) {
      router.push("/dashboard");
    } else {
      // Go to billing page for payment
      router.push("/dashboard/billing");
    }

    setLoadingPlan(null);
  };

  return (
    <section id="pricing" className="max-w-7xl mx-auto px-6 py-24">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Simple Pricing</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Choose your plan
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Start free and upgrade when you need more. No hidden fees, cancel anytime.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <button
          onClick={() => setBillingPeriod(BILLING_PERIODS.MONTHLY)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            billingPeriod === BILLING_PERIODS.MONTHLY
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingPeriod(BILLING_PERIODS.YEARLY)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors relative",
            billingPeriod === BILLING_PERIODS.YEARLY
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Yearly
          <span className="absolute -top-2 -right-12 px-2 py-0.5 rounded-full bg-green-500 text-white text-xs font-semibold">
            -{yearlyDiscount}%
          </span>
        </button>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="relative border border-border rounded-3xl p-8 hover:border-foreground/20 transition-all duration-300">
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-2">Starter</h3>
            <p className="text-muted-foreground text-sm">Perfect for getting started</p>
          </div>

          <div className="mb-8">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold text-foreground">Gratis</span>
            </div>
            <p className="text-muted-foreground text-sm mt-2">Free forever</p>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="w-full mb-8"
            onClick={() => handleSelectPlan(PLAN_TYPES.FREE)}
            disabled={loadingPlan === PLAN_TYPES.FREE}
          >
            {loadingPlan === PLAN_TYPES.FREE ? "Loading..." : "Get Started"}
          </Button>

          <ul className="space-y-4">
            {FREE_FEATURES.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div
                  className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    feature.included
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Check className="h-3 w-3" />
                </div>
                <span
                  className={cn(
                    "text-sm",
                    feature.included ? "text-foreground" : "text-muted-foreground line-through"
                  )}
                >
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pro Plan */}
        <div className="relative border-2 border-primary rounded-3xl p-8 bg-gradient-to-b from-primary/5 to-transparent shadow-lg shadow-primary/5">
          {/* Popular Badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              <Zap className="h-4 w-4" />
              <span>Most Popular</span>
            </div>
          </div>

          <div className="mb-8 mt-2">
            <h3 className="text-xl font-semibold text-foreground mb-2">Pro</h3>
            <p className="text-muted-foreground text-sm">For serious budgeters</p>
          </div>

          <div className="mb-8">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold text-foreground">
                {formatPrice(proPrice)}
              </span>
              <span className="text-muted-foreground">
                /{billingPeriod === BILLING_PERIODS.MONTHLY ? "month" : "year"}
              </span>
            </div>
            <p className="text-muted-foreground text-sm mt-2">
              {billingPeriod === BILLING_PERIODS.YEARLY
                ? `${formatPrice(Math.round(proPrice / 12))}/month, billed yearly`
                : "7-day free trial included"}
            </p>
          </div>

          <Button
            size="lg"
            className="w-full mb-8 bg-primary hover:bg-primary/90"
            onClick={() => handleSelectPlan(PLAN_TYPES.PRO)}
            disabled={loadingPlan === PLAN_TYPES.PRO}
          >
            {loadingPlan === PLAN_TYPES.PRO
              ? "Loading..."
              : session?.user
                ? "Upgrade to Pro"
                : "Start Free Trial"}
          </Button>

          <ul className="space-y-4">
            {PRO_FEATURES.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3 w-3" />
                </div>
                <span className="text-sm text-foreground">{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Trust Badge */}
      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground">
          🔒 Secure payment via QRIS • Cancel anytime • No hidden fees
        </p>
      </div>
    </section>
  );
}
