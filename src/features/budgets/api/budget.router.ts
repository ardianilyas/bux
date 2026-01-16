import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {
  budgetListInputSchema,
  createBudgetSchema,
  updateBudgetSchema,
  getBudgetByIdSchema,
  deleteBudgetSchema,
} from "../schemas";
import { db } from "@/db";
import { budgets } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit-logger";
import { getRequestMetadata } from "@/lib/request-metadata";

export const budgetRouter = createTRPCRouter({
  list: protectedProcedure
    .input(budgetListInputSchema)
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const data = await db.query.budgets.findMany({
        where: eq(budgets.userId, ctx.session.user.id),
        limit: pageSize,
        offset: offset,
        with: {
          category: true,
        },
      });

      const [totalResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(budgets)
        .where(eq(budgets.userId, ctx.session.user.id));

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

  getById: protectedProcedure
    .input(getBudgetByIdSchema)
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
    .input(createBudgetSchema)
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
    .input(updateBudgetSchema)
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
    .input(deleteBudgetSchema)
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
