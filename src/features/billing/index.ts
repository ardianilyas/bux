/**
 * Billing Feature Module
 * Public exports for the billing feature
 */

// Constants & Types
export {
  PLAN_TYPES,
  PLAN_LIMITS,
  PLAN_PRICING,
  TRIAL_CONFIG,
  BILLING_PERIODS,
  BILLING_PERIOD_DAYS,
  PAYMENT_STATUS,
  BILLING_ERRORS,
  BILLING_SUCCESS,
  getPlanLimit,
  hasFeatureAccess,
  isOverLimit,
  getTrialEndDate,
  getBillingPeriodEndDate,
  type PlanType,
  type PlanLimits,
  type BillingPeriod,
  type PaymentStatus,
} from "./lib/billing-constants";

// Xendit Client
export {
  createProSubscriptionPayment,
  getPaymentStatus,
  verifyWebhookSignature,
  parseWebhookMetadata,
  type CreatePaymentParams,
  type PaymentResult,
} from "./lib/xendit-client";

// Plan Limits
export {
  checkBudgetLimit,
  checkSavingsLimit,
  enforceBudgetLimit,
  enforceSavingsLimit,
  type LimitCheckResult,
} from "./lib/plan-limits";

// Components
export { PricingSection } from "./components/pricing-section";
export { BillingView } from "./components/billing-view";
export { PaymentHistoryTable } from "./components/payment-history-table";
