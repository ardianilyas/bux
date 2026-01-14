import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { subscriptions, expenses } from "@/db/schema";
import { eq, desc, and, lte, gte } from "drizzle-orm";

export const subscriptionRouter = createTRPCRouter({
  // List user's subscriptions
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.query.subscriptions.findMany({
      where: eq(subscriptions.userId, ctx.session.user.id),
      orderBy: [desc(subscriptions.createdAt)],
      with: {
        category: true,
      },
    });
  }),

  // Create subscription
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        amount: z.number().positive(),
        billingCycle: z.enum(["weekly", "monthly", "yearly"]),
        nextBillingDate: z.date(),
        categoryId: z.string().uuid().optional(),
        isActive: z.boolean().default(true),
        createExpense: z.boolean().default(false),
      })
    )
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

        return subscription;
      });
    }),

  // Update subscription
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        amount: z.number().positive().optional(),
        billingCycle: z.enum(["weekly", "monthly", "yearly"]).optional(),
        nextBillingDate: z.date().optional(),
        categoryId: z.string().uuid().optional().nullable(),
        isActive: z.boolean().optional(),
      })
    )
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
});
