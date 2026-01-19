/**
 * Xendit Client
 * Handles all Xendit API interactions for QRIS payments
 */

import Xendit from "xendit-node";
import {
  XENDIT_CONFIG,
  PLAN_PRICING,
  PLAN_TYPES,
  BILLING_PERIODS,
  type BillingPeriod,
} from "./billing-constants";

// ==================== Client Initialization ====================

if (!process.env.XENDIT_SECRET_KEY) {
  console.warn("XENDIT_SECRET_KEY is not set. Payment features will not work.");
}

const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY || "",
});

// ==================== Types ====================

export interface CreatePaymentParams {
  userId: string;
  userEmail: string;
  billingPeriod: BillingPeriod;
}

export interface PaymentResult {
  paymentRequestId: string;
  invoiceUrl: string;
  status: string;
  amount: number;
}

// ==================== Payment Creation ====================

/**
 * Create an Invoice for Pro subscription
 * Allows all payment methods (QRIS, VA, E-Wallet, etc.)
 */
export async function createProSubscriptionPayment(
  params: CreatePaymentParams
): Promise<PaymentResult> {
  const { userId, userEmail, billingPeriod } = params;
  const amount = PLAN_PRICING[PLAN_TYPES.PRO][billingPeriod];
  const referenceId = generateReferenceId(userId, billingPeriod);

  // Base URL for redirection
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const response = await xenditClient.Invoice.createInvoice({
    data: {
      externalId: referenceId,
      amount,
      currency: XENDIT_CONFIG.currency,
      description: `Bux Pro Subscription (${billingPeriod === BILLING_PERIODS.MONTHLY ? "Monthly" : "Yearly"})`,
      customer: {
        email: userEmail,
      },
      customerNotificationPreference: {
        invoiceCreated: ["email"],
        invoicePaid: ["email"],
      },
      successRedirectUrl: `${baseUrl}/dashboard/billing?payment_status=success`,
      failureRedirectUrl: `${baseUrl}/dashboard/billing?payment_status=failed`,
      metadata: {
        userId,
        userEmail,
        plan: PLAN_TYPES.PRO,
        billingPeriod,
      },
    },
  });

  return {
    paymentRequestId: response.id!, // Invoice ID
    invoiceUrl: response.invoiceUrl!,
    status: response.status!,
    amount,
  };
}

// ==================== Payment Status ====================

/**
 * Get payment request status from Xendit
 */
export async function getPaymentStatus(paymentRequestId: string) {
  const response = await xenditClient.PaymentRequest.getPaymentRequestByID({
    paymentRequestId,
  });

  return {
    id: response.id,
    status: response.status,
    amount: response.amount,
    metadata: response.metadata,
  };
}

// ==================== Webhook Verification ====================

/**
 * Simulate payment for testing (Development Only)
 * In dev mode, we directly mark the payment as succeeded rather than calling Xendit's API
 */
export async function simulatePayment(paymentRequestId: string) {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Simulation endpoint only available in development");
  }

  // In development, we just return success
  // The actual "payment" will be processed by manually updating the user's plan
  // This simulates what would happen when Xendit sends a webhook
  return {
    success: true,
    paymentRequestId,
    status: "SUCCEEDED"
  };
}

// ==================== Webhook Verification ====================


/**
 * Verify Xendit webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const webhookToken = process.env.XENDIT_WEBHOOK_TOKEN;
  if (!webhookToken) {
    console.error("XENDIT_WEBHOOK_TOKEN is not set");
    return false;
  }

  // Xendit uses x-callback-token header for verification
  return signature === webhookToken;
}

// ==================== Helper Functions ====================

/**
 * Generate a unique reference ID for payment tracking
 */
function generateReferenceId(userId: string, billingPeriod: BillingPeriod): string {
  const timestamp = Date.now();
  const periodShort = billingPeriod === BILLING_PERIODS.MONTHLY ? "m" : "y";
  return `bux_pro_${periodShort}_${userId}_${timestamp}`;
}

/**
 * Parse reference ID to extract userId and billingPeriod
 * Format: bux_pro_{periodShort}_{userId}_{timestamp}
 */
export function parseReferenceId(referenceId: string | undefined): {
  userId: string | undefined;
  billingPeriod: BillingPeriod | undefined;
} {
  if (!referenceId || !referenceId.startsWith("bux_pro_")) {
    return { userId: undefined, billingPeriod: undefined };
  }

  const parts = referenceId.split("_");
  // Format: bux_pro_{m|y}_{userId}_{timestamp}
  // parts[0] = "bux", parts[1] = "pro", parts[2] = period, parts[3] = userId, parts[4] = timestamp
  if (parts.length < 5) {
    return { userId: undefined, billingPeriod: undefined };
  }

  const periodShort = parts[2];
  const userId = parts[3];
  const billingPeriod = periodShort === "m" ? BILLING_PERIODS.MONTHLY : BILLING_PERIODS.YEARLY;

  return { userId, billingPeriod };
}

/**
 * Parse metadata from Xendit webhook payload
 */
export function parseWebhookMetadata(metadata: Record<string, unknown> | undefined) {
  if (!metadata) {
    return {
      userId: undefined,
      userEmail: undefined,
      plan: undefined,
      billingPeriod: undefined,
    };
  }
  return {
    userId: metadata.userId as string,
    userEmail: metadata.userEmail as string,
    plan: metadata.plan as string,
    billingPeriod: metadata.billingPeriod as BillingPeriod,
  };
}
