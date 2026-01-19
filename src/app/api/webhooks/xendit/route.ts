/**
 * Xendit Webhook Handler
 * Handles payment success/failure callbacks from Xendit
 */

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, payments } from "@/db/schema";
import {
  PLAN_TYPES,
  BILLING_PERIODS,
  XENDIT_WEBHOOK_EVENTS,
  BILLING_ERRORS,
  getBillingPeriodEndDate,
  type BillingPeriod,
} from "@/features/billing/lib/billing-constants";
import {
  verifyWebhookSignature,
  parseWebhookMetadata,
  parseReferenceId,
} from "@/features/billing/lib/xendit-client";

// ==================== Webhook Handler ====================

export async function POST(request: NextRequest) {
  console.log("[Xendit Webhook] Incoming request...");

  try {
    // Get the callback token for verification
    const callbackToken = request.headers.get("x-callback-token");
    const body = await request.text();

    // Verify webhook signature
    if (!callbackToken || !verifyWebhookSignature(body, callbackToken)) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: BILLING_ERRORS.INVALID_WEBHOOK_SIGNATURE },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);

    // Try to get event from header (standard for new Xendit callbacks)
    let event = request.headers.get("x-callback-event");

    // Fallback: Try to get event from body (legacy style)
    if (!event && payload.event) {
      event = payload.event;
    }

    // Determine data source: 
    // If event is from header, payload IS the data (usually).
    // If event is from body, data is usually inside payload.data.
    const data = payload.data || payload;

    console.log(`[Xendit Webhook] Received event: ${event}`);
    console.log(`[Xendit Webhook] Status: ${data.status}`);

    // Fallback: If no event name, infer from status (Invoice callback style)
    if (!event && data.status) {
      if (data.status === "PAID" || data.status === "SETTLED") {
        console.log("[Xendit Webhook] Event inferred from status: INVOICE_PAID");
        await handleInvoicePaid(data);
        return NextResponse.json({ received: true });
      } else if (data.status === "EXPIRED") {
        console.log("[Xendit Webhook] Event inferred from status: INVOICE_EXPIRED");
        await handleInvoiceExpired(data);
        return NextResponse.json({ received: true });
      }
    }

    switch (event) {
      case XENDIT_WEBHOOK_EVENTS.PAYMENT_SUCCEEDED:
      case XENDIT_WEBHOOK_EVENTS.QR_PAYMENT:
        await handlePaymentSucceeded(data, event);
        break;

      case XENDIT_WEBHOOK_EVENTS.INVOICE_PAID:
        await handleInvoicePaid(data);
        break;

      case XENDIT_WEBHOOK_EVENTS.INVOICE_EXPIRED:
        await handleInvoiceExpired(data);
        break;

      case XENDIT_WEBHOOK_EVENTS.PAYMENT_METHOD_ACTIVATED:
        // This is just QR code creation, not payment success
        console.log(`[Xendit Webhook] QR code created. Waiting for actual payment...`);
        console.log(`[Xendit Webhook] Payment method ID: ${data.id}`);
        break;

      case XENDIT_WEBHOOK_EVENTS.PAYMENT_FAILED:
        await handlePaymentFailed(data);
        break;

      case XENDIT_WEBHOOK_EVENTS.PAYMENT_EXPIRED:
        await handlePaymentExpired(data);
        break;

      default:
        console.log(`[Xendit Webhook] Unhandled event: ${event} (Status: ${data.status})`);
    }

    return NextResponse.json({ received: true, server_time: new Date().toISOString(), version: "v2-debug" });
  } catch (error) {
    console.error("[Xendit Webhook] Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// ==================== Event Handlers ====================

async function handlePaymentSucceeded(data: Record<string, unknown>, event: string) {
  // For payment_method.activated, the ID we saved is in payment_request_id field
  const xenditId = (data.payment_request_id as string) || (data.id as string);

  console.log(`[Xendit Webhook] Processing event: ${event}`);
  console.log(`[Xendit Webhook] Looking up user with ID: ${xenditId} (from payment_request_id: ${data.payment_request_id}, id: ${data.id})`);
  console.log(`[Xendit Webhook] reference_id: ${data.reference_id}, metadata:`, data.metadata);

  // Method 1: Parse from reference_id (if it matches our format)
  const refData = parseReferenceId(data.reference_id as string);

  // Method 2: Parse from metadata
  const metadata = parseWebhookMetadata(data.metadata as Record<string, unknown>);

  // Method 3: Lookup user by xenditPaymentRequestId stored in database
  let userId = refData.userId || metadata.userId;
  let billingPeriod = refData.billingPeriod || metadata.billingPeriod;

  // If userId not found from reference_id or metadata, try database lookup
  if (!userId && xenditId) {
    console.log(`[Xendit Webhook] userId not found in reference_id/metadata, trying database lookup with: ${xenditId}`);
    const [foundUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.xenditPaymentRequestId, xenditId));

    if (foundUser) {
      userId = foundUser.id;
      billingPeriod = BILLING_PERIODS.MONTHLY; // Default to monthly
      console.log(`[Xendit Webhook] Found user via database lookup: ${userId}`);
    }
  }

  if (!userId) {
    console.error("[Xendit Webhook] Could not determine userId from any source");
    console.error(`[Xendit Webhook] Tried: reference_id, metadata, and database lookup (${xenditId})`);
    return;
  }

  const planExpiresAt = getBillingPeriodEndDate(billingPeriod || BILLING_PERIODS.MONTHLY);

  // Extract QR code data if available
  const qrCode = data.qr_code as Record<string, unknown> | undefined;
  const channelProperties = qrCode?.channel_properties as Record<string, unknown> | undefined;

  console.log(`[Xendit Webhook] Saving payment record for user ${userId}`);
  console.log(`[Xendit Webhook] Data: xenditId=${data.id}, referenceId=${data.reference_id}, amount=${qrCode?.amount}`);

  // Save payment record
  try {
    await db.insert(payments).values({
      xenditId: (data.id as string) || "",
      referenceId: (data.reference_id as string) || "",
      type: (data.type as string) || "QR_CODE",
      status: event === XENDIT_WEBHOOK_EVENTS.PAYMENT_SUCCEEDED ? "SUCCEEDED" : (data.status as string) || "ACTIVE",
      amount: (qrCode?.amount as number) || (data.amount as number) || 0,
      currency: (qrCode?.currency as string) || (data.currency as string) || "IDR",
      billingPeriod: billingPeriod || "monthly",
      qrString: (channelProperties?.qr_string as string) || null,
      channelCode: (qrCode?.channel_code as string) || "QRIS",
      failureCode: (data.failure_code as string) || null,
      userId,
      xenditCreatedAt: data.created ? new Date(data.created as string) : null,
    });
    console.log(`[Xendit Webhook] Payment record saved successfully`);
  } catch (error) {
    console.error(`[Xendit Webhook] Failed to save payment record:`, error);
  }

  // Update user plan
  await db
    .update(users)
    .set({
      plan: PLAN_TYPES.PRO,
      planExpiresAt,
      trialEndsAt: null, // Clear trial if upgrading from trial
      xenditPaymentRequestId: null, // Clear pending payment
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  console.log(`[Xendit Webhook] User ${userId} upgraded to Pro until ${planExpiresAt}`);
}

async function handlePaymentFailed(data: Record<string, unknown>) {
  const metadata = parseWebhookMetadata(data.metadata as Record<string, unknown>);
  const { userId } = metadata;

  if (!userId) {
    console.error("[Xendit Webhook] Missing userId in metadata");
    return;
  }

  // Clear the pending payment request
  await db
    .update(users)
    .set({
      xenditPaymentRequestId: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  console.log(`[Xendit Webhook] Payment failed for user ${userId}`);
}

async function handlePaymentExpired(data: Record<string, unknown>) {
  const metadata = parseWebhookMetadata(data.metadata as Record<string, unknown>);
  const { userId } = metadata;

  if (!userId) {
    console.error("[Xendit Webhook] Missing userId in metadata");
    return;
  }

  // Clear the expired payment request
  await db
    .update(users)
    .set({
      xenditPaymentRequestId: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  console.log(`[Xendit Webhook] Payment expired for user ${userId}`);
}

async function handleInvoicePaid(data: Record<string, unknown>) {
  const invoiceId = data.id as string;
  const referenceId = data.external_id as string;
  const amount = data.amount as number;

  console.log(`[Xendit Webhook] Processing invoice paid: ${invoiceId}`);
  console.log(`[Xendit Webhook] Method: ${data.payment_method} (${data.payment_channel})`);
  console.log(`[Xendit Webhook] External ID: ${referenceId}`);

  // Parse user from reference ID (external_id)
  const { userId, billingPeriod } = parseReferenceId(referenceId);

  if (!userId) {
    console.error(`[Xendit Webhook] Could not extract userId from external_id: ${referenceId}`);
    return;
  }

  const planExpiresAt = getBillingPeriodEndDate(billingPeriod || BILLING_PERIODS.MONTHLY);

  // Save payment record
  try {
    await db.insert(payments).values({
      xenditId: invoiceId,
      referenceId,
      type: "INVOICE",
      status: "SUCCEEDED",
      amount,
      currency: "IDR",
      billingPeriod: billingPeriod || "monthly",
      channelCode: (data.payment_channel as string) || "INVOICE",
      qrString: null,
      userId,
      xenditCreatedAt: data.created ? new Date(data.created as string) : new Date(),
    });
    console.log(`[Xendit Webhook] Payment record saved for invoice ${invoiceId}`);
  } catch (error) {
    console.error(`[Xendit Webhook] Failed to save payment record:`, error);
  }

  // Update user plan
  await db
    .update(users)
    .set({
      plan: PLAN_TYPES.PRO,
      planExpiresAt,
      trialEndsAt: null,
      xenditPaymentRequestId: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  console.log(`[Xendit Webhook] User ${userId} upgraded to Pro via Invoice`);
}

async function handleInvoiceExpired(data: Record<string, unknown>) {
  const referenceId = data.external_id as string;
  const { userId } = parseReferenceId(referenceId);

  if (!userId) {
    console.error(`[Xendit Webhook] Could not extract userId from external_id: ${referenceId}`);
    return;
  }

  await db
    .update(users)
    .set({
      xenditPaymentRequestId: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  console.log(`[Xendit Webhook] Invoice expired for user ${userId}`);
}
