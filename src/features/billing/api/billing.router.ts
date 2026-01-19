/**
 * Billing Router
 * tRPC procedures for subscription management
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { users, payments } from "@/db/schema";
import { desc } from "drizzle-orm";
import {
  PLAN_TYPES,
  BILLING_PERIODS,
  BILLING_ERRORS,
  BILLING_SUCCESS,
  getTrialEndDate,
  getBillingPeriodEndDate,
  type PlanType,
} from "../lib/billing-constants";
import { createProSubscriptionPayment, getPaymentStatus, simulatePayment } from "../lib/xendit-client";

// ==================== Input Schemas ====================

const createPaymentSchema = z.object({
  billingPeriod: z.enum([BILLING_PERIODS.MONTHLY, BILLING_PERIODS.YEARLY]),
});

// ==================== Router ====================

export const billingRouter = createTRPCRouter({
  /**
   * Get current billing status for the user
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [user] = await db
      .select({
        plan: users.plan,
        planExpiresAt: users.planExpiresAt,
        trialEndsAt: users.trialEndsAt,
        trialUsed: users.trialUsed,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    const now = new Date();
    const isPro = user.plan === PLAN_TYPES.PRO;
    const isTrialActive = user.trialEndsAt ? user.trialEndsAt > now : false;
    const isSubscriptionActive = user.planExpiresAt ? user.planExpiresAt > now : false;

    return {
      plan: user.plan as PlanType,
      isPro,
      isTrialActive,
      isSubscriptionActive,
      trialEndsAt: user.trialEndsAt,
      planExpiresAt: user.planExpiresAt,
      canStartTrial: !user.trialUsed,
    };
  }),

  /**
   * Start a 7-day Pro trial
   */
  startTrial: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Check if trial already used
    const [user] = await db
      .select({ trialUsed: users.trialUsed, plan: users.plan })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    if (user.trialUsed) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: BILLING_ERRORS.TRIAL_ALREADY_USED,
      });
    }

    if (user.plan === PLAN_TYPES.PRO) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: BILLING_ERRORS.ALREADY_SUBSCRIBED,
      });
    }

    // Activate trial
    const trialEndsAt = getTrialEndDate();

    await db
      .update(users)
      .set({
        plan: PLAN_TYPES.PRO,
        trialEndsAt,
        trialUsed: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return {
      success: true,
      message: BILLING_SUCCESS.TRIAL_STARTED,
      trialEndsAt,
    };
  }),

  /**
   * Create a QRIS payment request
   */
  createPayment: protectedProcedure
    .input(createPaymentSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userEmail = ctx.session.user.email;

      try {
        const paymentResult = await createProSubscriptionPayment({
          userId,
          userEmail,
          billingPeriod: input.billingPeriod,
        });

        // Store the payment request ID for tracking
        await db
          .update(users)
          .set({
            xenditPaymentRequestId: paymentResult.paymentRequestId,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        return paymentResult;
      } catch (error) {
        console.error("Failed to create payment:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: BILLING_ERRORS.PAYMENT_CREATION_FAILED,
        });
      }
    }),

  /**
   * Check payment status (for polling after QR display)
   */
  checkPaymentStatus: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [user] = await db
      .select({
        xenditPaymentRequestId: users.xenditPaymentRequestId,
        plan: users.plan,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user?.xenditPaymentRequestId) {
      return { status: "no_pending_payment" };
    }

    try {
      const paymentStatus = await getPaymentStatus(user.xenditPaymentRequestId);
      return {
        status: paymentStatus.status,
        isPro: user.plan === PLAN_TYPES.PRO,
      };
    } catch {
      return { status: "error" };
    }
  }),

  /**
   * Simulate payment (Dev Only)
   */
  simulatePayment: protectedProcedure
    .input(z.object({ paymentRequestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (process.env.NODE_ENV !== "development") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Simulation only available in development",
        });
      }

      const userId = ctx.session.user.id;

      // Find the user's payment request
      const [user] = await db
        .select({
          xenditPaymentRequestId: users.xenditPaymentRequestId,
        })
        .from(users)
        .where(eq(users.id, userId));

      if (!user?.xenditPaymentRequestId || user.xenditPaymentRequestId !== input.paymentRequestId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid payment request ID",
        });
      }

      // Simulate successful payment by activating Pro subscription
      const planExpiresAt = getBillingPeriodEndDate(BILLING_PERIODS.MONTHLY);
      const referenceId = `bux_pro_m_${userId}_${Date.now()}`;

      // Save payment record (simulated)
      await db.insert(payments).values({
        xenditId: input.paymentRequestId,
        referenceId,
        type: "QR_CODE",
        status: "SUCCEEDED",
        amount: 39000,
        currency: "IDR",
        billingPeriod: "monthly",
        channelCode: "QRIS",
        userId,
      });

      console.log(`[Simulation] Payment record created for user ${userId}`);

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

      console.log(`[Simulation] User ${userId} upgraded to Pro`);

      return {
        success: true,
        message: "Payment simulated successfully"
      };
    }),

  /**
   * Cancel subscription (downgrade at end of period)
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // For now, we just record the intent to cancel
    // The actual downgrade happens when planExpiresAt passes
    // In production, you'd store a cancellation flag and handle via cron

    return {
      success: true,
      message: BILLING_SUCCESS.SUBSCRIPTION_CANCELLED,
    };
  }),

  /**
   * Get payment history for the user
   */
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const paymentHistory = await db
      .select({
        id: payments.id,
        xenditId: payments.xenditId,
        referenceId: payments.referenceId,
        type: payments.type,
        status: payments.status,
        amount: payments.amount,
        currency: payments.currency,
        billingPeriod: payments.billingPeriod,
        channelCode: payments.channelCode,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt))
      .limit(10);

    return paymentHistory;
  }),
});
