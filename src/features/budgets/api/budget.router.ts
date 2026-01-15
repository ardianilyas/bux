import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { budgets } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit-logger";
import { getRequestMetadata } from "@/lib/request-metadata";

export const budgetRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.query.budgets.findMany({
      where: eq(budgets.userId, ctx.session.user.id),
      with: {
        category: true,
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return db.query.budgets.findFirst({
        where: and(
          eq(budgets.id, input.id),
          eq(budgets.userId, ctx.session.user.id)
        ),
        with: {
          category: true,
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        categoryId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if budget already exists for this category
      const existing = await db.query.budgets.findFirst({
        where: and(
          eq(budgets.categoryId, input.categoryId),
          eq(budgets.userId, ctx.session.user.id)
        ),
      });

      if (existing) {
        throw new Error("A budget already exists for this category");
      }

      const [budget] = await db
        .insert(budgets)
        .values({
          amount: input.amount,
          categoryId: input.categoryId,
          userId: ctx.session.user.id,
        })
        .returning();

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();
      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.BUDGET.CREATE,
        targetId: budget.id,
        targetType: "budget",
        metadata: { amount: input.amount, categoryId: input.categoryId },
        ipAddress,
        userAgent,
      });

      return budget;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        amount: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [budget] = await db
        .update(budgets)
        .set({
          amount: input.amount,
          updatedAt: new Date(),
        })
        .where(
          and(eq(budgets.id, input.id), eq(budgets.userId, ctx.session.user.id))
        )
        .returning();

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();
      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.BUDGET.UPDATE,
        targetId: input.id,
        targetType: "budget",
        metadata: { amount: input.amount },
        ipAddress,
        userAgent,
      });

      return budget;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(budgets)
        .where(
          and(
            eq(budgets.id, input.id),
            eq(budgets.userId, ctx.session.user.id)
          )
        );

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();
      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.BUDGET.DELETE,
        targetId: input.id,
        targetType: "budget",
        ipAddress,
        userAgent,
      });

      return { success: true };
    }),
});
