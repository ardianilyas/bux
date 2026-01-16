import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {
  budgetListInputSchema,
  createBudgetSchema,
  updateBudgetSchema,
  getBudgetByIdSchema,
  deleteBudgetSchema,
} from "../schemas";
import { db } from "@/db";
import { budgets, expenses } from "@/db/schema";
import { eq, and, sql, gte } from "drizzle-orm";
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit-logger";
import { getRequestMetadata } from "@/lib/request-metadata";

export const budgetRouter = createTRPCRouter({
  list: protectedProcedure
    .input(budgetListInputSchema)
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      // Get budgets
      const data = await db.query.budgets.findMany({
        where: eq(budgets.userId, ctx.session.user.id),
        limit: pageSize,
        offset: offset,
        with: {
          category: true,
        },
      });

      // Calculate spending for current month for these categories
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get category IDs from the budgets
      const categoryIds = data.map(b => b.categoryId);

      const spendingMap = new Map<string, number>();

      if (categoryIds.length > 0) {
        // Import expenses schema if not already there
        // Note: I will need to ensure 'expenses' and 'inArray' are imported in the next step or via imports update
        const spending = await db
          .select({
            categoryId: expenses.categoryId,
            amount: sql<number>`coalesce(sum(${expenses.amount} * ${expenses.exchangeRate}), 0)::int`,
          })
          .from(expenses)
          .where(
            and(
              eq(expenses.userId, ctx.session.user.id),
              gte(expenses.date, startOfMonth),
              // We can filter by specific categories to be efficient, but for now filtering by user is enough
              // inArray(expenses.categoryId, categoryIds) // Ideally
            )
          )
          .groupBy(expenses.categoryId);

        spending.forEach(s => {
          if (s.categoryId) {
            spendingMap.set(s.categoryId, s.amount);
          }
        });
      }

      // Merge spending into budgets
      const dataWithSpent = data.map(budget => ({
        ...budget,
        spent: spendingMap.get(budget.categoryId) || 0,
      }));

      const [totalResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(budgets)
        .where(eq(budgets.userId, ctx.session.user.id));

      const total = totalResult?.count ?? 0;

      return {
        data: dataWithSpent,
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
