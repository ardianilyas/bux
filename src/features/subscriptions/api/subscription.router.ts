import { z } from "zod";
import { createSubscriptionSchema, updateSubscriptionSchema } from "@/lib/validations/subscription";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { subscriptions, expenses } from "@/db/schema";
import { eq, desc, and, lte, gte, sql } from "drizzle-orm";
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit-logger";
import { getRequestMetadata } from "@/lib/request-metadata";

export const subscriptionRouter = createTRPCRouter({
  // List user's subscriptions
  list: protectedProcedure
    .input(
      z
        .object({
          page: z.number().min(1).default(1),
          pageSize: z.number().min(1).max(100).default(10),
        })

    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const data = await db.query.subscriptions.findMany({
        where: eq(subscriptions.userId, ctx.session.user.id),
        orderBy: [desc(subscriptions.createdAt)],
        limit: pageSize,
        offset: offset,
        with: {
          category: true,
        },
      });

      const [totalResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(subscriptions)
        .where(eq(subscriptions.userId, ctx.session.user.id));

      const total = totalResult?.count ?? 0;

      return {
        data,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    }),

  // Create subscription
  create: protectedProcedure
    .input(createSubscriptionSchema)
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        const [subscription] = await tx
          .insert(subscriptions)
          .values({
            name: input.name,
            amount: input.amount,
            billingCycle: input.billingCycle,
            nextBillingDate: input.nextBillingDate,
            categoryId: input.categoryId,
            userId: ctx.session.user.id,
            isActive: input.isActive,
          })
          .returning();

        if (input.createExpense) {
          await tx.insert(expenses).values({
            amount: input.amount,
            description: `Subscription: ${input.name}`,
            date: new Date(),
            categoryId: input.categoryId,
            userId: ctx.session.user.id,
            subscriptionId: subscription.id,
          });
        }

        // Log audit event
        const { ipAddress, userAgent } = await getRequestMetadata();
        await logAudit({
          userId: ctx.session.user.id,
          action: AUDIT_ACTIONS.BUDGET.CREATE,
          targetId: subscription.id,
          targetType: "subscription",
          metadata: { name: input.name, amount: input.amount },
          ipAddress,
          userAgent,
        });

        return subscription;
      });
    }),

  // Update subscription
  update: protectedProcedure
    .input(updateSubscriptionSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [subscription] = await db
        .update(subscriptions)
        .set({ ...data, updatedAt: new Date() })
        .where(
          and(
            eq(subscriptions.id, id),
            eq(subscriptions.userId, ctx.session.user.id)
          )
        )
        .returning();

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();
      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.BUDGET.UPDATE,
        targetId: input.id,
        targetType: "subscription",
        metadata: data,
        ipAddress,
        userAgent,
      });

      return subscription;
    }),

  // Delete subscription
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(subscriptions)
        .where(
          and(
            eq(subscriptions.id, input.id),
            eq(subscriptions.userId, ctx.session.user.id)
          )
        );

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();
      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.BUDGET.DELETE,
        targetId: input.id,
        targetType: "subscription",
        ipAddress,
        userAgent,
      });

      return { success: true };
    }),

  // Get upcoming subscriptions (next 7 days)
  getUpcoming: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    return db.query.subscriptions.findMany({
      where: and(
        eq(subscriptions.userId, ctx.session.user.id),
        eq(subscriptions.isActive, true),
        gte(subscriptions.nextBillingDate, now),
        lte(subscriptions.nextBillingDate, nextWeek)
      ),
      orderBy: [subscriptions.nextBillingDate],
      with: {
        category: true,
      },
    });
  }),

  // Process due subscriptions for current user
  processRecurring: protectedProcedure.mutation(async ({ ctx }) => {
    const { processUserSubscriptions } = await import("@/lib/recurring");

    const results = await processUserSubscriptions(ctx.session.user.id);

    return {
      success: true,
      processed: results.length,
      results: results.map(r => ({
        name: r.subscriptionName,
        expensesCreated: r.expensesCreated,
        nextBillingDate: r.newNextBillingDate,
      })),
    };
  }),
});
