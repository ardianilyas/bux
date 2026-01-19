/**
 * Billing Constants
 * Centralized configuration for subscription plans, limits, and pricing
 */

// ==================== Plan Types ====================

export const PLAN_TYPES = {
  FREE: "free",
  PRO: "pro",
} as const;

export type PlanType = (typeof PLAN_TYPES)[keyof typeof PLAN_TYPES];

// ==================== Plan Limits ====================

export const PLAN_LIMITS = {
  [PLAN_TYPES.FREE]: {
    maxBudgets: 3,
    maxSavingsGoals: 1,
    hasReceiptScanning: false,
    hasAdvancedAnalytics: false,
    hasDataExport: false,
    hasPrioritySupport: false,
  },
  [PLAN_TYPES.PRO]: {
    maxBudgets: Infinity,
    maxSavingsGoals: Infinity,
    hasReceiptScanning: true,
    hasAdvancedAnalytics: true,
    hasDataExport: true,
    hasPrioritySupport: true,
  },
} as const;

export type PlanLimits = (typeof PLAN_LIMITS)[PlanType];

// ==================== Pricing (IDR) ====================

export const PLAN_PRICING = {
  [PLAN_TYPES.FREE]: {
    monthly: 0,
    yearly: 0,
  },
  [PLAN_TYPES.PRO]: {
    monthly: 39_000, // Rp 39.000
    yearly: 399_000, // Rp 399.000 (~17% discount)
  },
} as const;

// ==================== Trial Configuration ====================

export const TRIAL_CONFIG = {
  durationDays: 7,
  allowedPlan: PLAN_TYPES.PRO,
} as const;

// ==================== Billing Periods ====================

export const BILLING_PERIODS = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;

export type BillingPeriod = (typeof BILLING_PERIODS)[keyof typeof BILLING_PERIODS];

export const BILLING_PERIOD_DAYS = {
  [BILLING_PERIODS.MONTHLY]: 30,
  [BILLING_PERIODS.YEARLY]: 365,
} as const;

// ==================== Xendit Configuration ====================

export const XENDIT_CONFIG = {
  currency: "IDR",
  qrCodeChannel: "QRIS",
  reusability: "ONE_TIME_USE",
  paymentMethodType: "QR_CODE",
} as const;

// ==================== Payment Status ====================

export const PAYMENT_STATUS = {
  PENDING: "pending",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
  EXPIRED: "expired",
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

// ==================== Webhook Events ====================

export const XENDIT_WEBHOOK_EVENTS = {
  PAYMENT_SUCCEEDED: "payment.succeeded",
  PAYMENT_FAILED: "payment.failed",
  PAYMENT_EXPIRED: "payment.expired",
  QR_PAYMENT: "qr.payment", // Legacy/Direct QR event
  PAYMENT_METHOD_ACTIVATED: "payment_method.activated", // QR Created
  INVOICE_PAID: "invoice.paid",
  INVOICE_EXPIRED: "invoice.expired",
} as const;

// ==================== Error Messages ====================

export const BILLING_ERRORS = {
  BUDGET_LIMIT_REACHED: "Upgrade to Pro to create more budgets",
  SAVINGS_LIMIT_REACHED: "Upgrade to Pro to create more savings goals",
  TRIAL_ALREADY_USED: "You have already used your free trial",
  PAYMENT_CREATION_FAILED: "Failed to create payment. Please try again.",
  INVALID_WEBHOOK_SIGNATURE: "Invalid webhook signature",
  ALREADY_SUBSCRIBED: "You already have an active Pro subscription",
} as const;

// ==================== Success Messages ====================

export const BILLING_SUCCESS = {
  TRIAL_STARTED: "Your 7-day Pro trial has started!",
  SUBSCRIPTION_ACTIVATED: "Welcome to Bux Pro!",
  SUBSCRIPTION_CANCELLED: "Your subscription will end at the current billing period",
} as const;

// ==================== Helper Functions ====================

/**
 * Get the limit for a specific feature based on plan type
 */
export function getPlanLimit<K extends keyof PlanLimits>(
  plan: PlanType,
  feature: K
): PlanLimits[K] {
  return PLAN_LIMITS[plan][feature];
}

/**
 * Check if a plan has access to a feature
 */
export function hasFeatureAccess(plan: PlanType, feature: keyof PlanLimits): boolean {
  const limit = PLAN_LIMITS[plan][feature];
  return typeof limit === "boolean" ? limit : limit > 0;
}

/**
 * Check if user has exceeded a numeric limit
 */
export function isOverLimit(plan: PlanType, feature: "maxBudgets" | "maxSavingsGoals", currentCount: number): boolean {
  const limit = PLAN_LIMITS[plan][feature];
  return currentCount >= limit;
}

/**
 * Get trial end date from now
 */
export function getTrialEndDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + TRIAL_CONFIG.durationDays);
  return date;
}

/**
 * Get billing period end date from now
 */
export function getBillingPeriodEndDate(period: BillingPeriod): Date {
  const date = new Date();
  date.setDate(date.getDate() + BILLING_PERIOD_DAYS[period]);
  return date;
}
