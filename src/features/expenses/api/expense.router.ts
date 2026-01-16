import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {
  expenseListInputSchema,
  createExpenseSchema,
  updateExpenseSchema,
  getExpenseByIdSchema,
  deleteExpenseSchema,
} from "../schemas";
import { db } from "@/db";
import { expenses, categories } from "@/db/schema";
import { eq, desc, and, ilike, gte, lte, sql } from "drizzle-orm";
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit-logger";
import { getRequestMetadata } from "@/lib/request-metadata";

export const expenseRouter = createTRPCRouter({
  list: protectedProcedure
    .input(expenseListInputSchema)
    .query(async ({ ctx, input }) => {
      const filters = [eq(expenses.userId, ctx.session.user.id)];

      if (input.search) {
        filters.push(ilike(expenses.description, `%${input.search}%`));
      }

      if (input.categoryId && input.categoryId !== "all") {
        filters.push(eq(expenses.categoryId, input.categoryId));
      }

      if (input.startDate) {
        filters.push(gte(expenses.date, new Date(input.startDate)));
      }

      if (input.endDate) {
        // Set end date to end of day
        const end = new Date(input.endDate);
        end.setHours(23, 59, 59, 999);
        filters.push(lte(expenses.date, end));
      }

      const { page, pageSize } = input;
      const offset = (page - 1) * pageSize;
      const whereClause = and(...filters);

      const data = await db.query.expenses.findMany({
        where: whereClause,
        orderBy: [desc(expenses.date)],
        limit: pageSize,
        offset: offset,
        with: {
          category: true,
        },
      });

      const [totalResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(expenses)
        .where(whereClause);

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

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const filters = [eq(expenses.userId, ctx.session.user.id)];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalResult] = await db
      .select({
        total: sql<number>`coalesce(sum(${expenses.amount} * ${expenses.exchangeRate}), 0)::int`,
        count: sql<number>`count(*)::int`,
      })
      .from(expenses)
      .where(and(...filters));

    const [thisMonthResult] = await db
      .select({
        total: sql<number>`coalesce(sum(${expenses.amount} * ${expenses.exchangeRate}), 0)::int`,
      })
      .from(expenses)
      .where(and(...filters, gte(expenses.date, startOfMonth)));

    return {
      total: totalResult?.total ?? 0,
      count: totalResult?.count ?? 0,
      thisMonth: thisMonthResult?.total ?? 0,
    };
  }),

  getTrends: protectedProcedure.query(async ({ ctx }) => {
    // Get last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const data = await db
      .select({
        month: sql<string>`to_char(${expenses.date}, 'Mon YY')`,
        sortKey: sql<string>`to_char(${expenses.date}, 'YYYY-MM')`,
        amount: sql<number>`coalesce(sum(${expenses.amount} * ${expenses.exchangeRate}), 0)::int`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, ctx.session.user.id),
          gte(expenses.date, sixMonthsAgo)
        )
      )
      .groupBy(sql`to_char(${expenses.date}, 'Mon YY'), to_char(${expenses.date}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${expenses.date}, 'YYYY-MM') ASC`);

    // Fill in missing months
    const filledData = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const monthStr = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      // Match format 'MMM YY' e.g. "Jan 24"
      // to_char 'MMM YY' returns "Jan 24". JS 'short' '2-digit' usually "Jan 24".
      // Let's ensure strict matching by comparing sortKey if possible, or just standardizing js side.
      // Actually, let's just use the JS generated month string for display and match by index or date.
      // Better: Generate the expected 'MMM YY' strings in JS and find in data.

      // Postgres 'MMM YY' might be 'Jan 24'. 
      // JS: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }) -> "Jan 24"
      // Let's verify sortKey 'YYYY-MM' matching.
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const sortKey = `${year}-${month}`;

      const found = data.find(item => item.sortKey === sortKey);

      filledData.push({
        month: found ? found.month : monthStr,
        amount: found ? found.amount : 0
      });
    }

    return filledData;
  }),

  getBreakdown: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const data = await db
      .select({
        id: categories.id,
        name: categories.name,
        color: categories.color,
        amount: sql<number>`coalesce(sum(${expenses.amount} * ${expenses.exchangeRate}), 0)::int`,
      })
      .from(expenses)
      .leftJoin(categories, eq(expenses.categoryId, categories.id))
      .where(
        and(
          eq(expenses.userId, ctx.session.user.id),
          gte(expenses.date, startOfMonth)
        )
      )
      .groupBy(categories.id, categories.name, categories.color)
      .orderBy(desc(sql`sum(${expenses.amount} * ${expenses.exchangeRate})`));

    return data.map((d) => ({
      id: d.id,
      name: d.name || "Uncategorized",
      color: d.color || "#6b7280",
      amount: d.amount,
    }));
  }),

  getById: protectedProcedure
    .input(getExpenseByIdSchema)
    .query(async ({ ctx, input }) => {
      return db.query.expenses.findFirst({
        where: and(
          eq(expenses.id, input.id),
          eq(expenses.userId, ctx.session.user.id)
        ),
        with: {
          category: true,
        },
      });
    }),

  create: protectedProcedure
    .input(createExpenseSchema)
    .mutation(async ({ ctx, input }) => {
      const [expense] = await db
        .insert(expenses)
        .values({
          amount: input.amount,
          currency: input.currency,
          exchangeRate: input.exchangeRate,
          description: input.description,
          date: input.date,
          categoryId: input.categoryId,
          userId: ctx.session.user.id,
        })
        .returning();

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();
      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.EXPENSE.CREATE,
        targetId: expense.id,
        targetType: "expense",
        metadata: {
          amount: expense.amount,
          description: expense.description,
        },
        ipAddress,
        userAgent,
      });

      return expense;
    }),

  update: protectedProcedure
    .input(updateExpenseSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [expense] = await db
        .update(expenses)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(and(eq(expenses.id, id), eq(expenses.userId, ctx.session.user.id)))
        .returning();

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();
      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.EXPENSE.UPDATE,
        targetId: input.id,
        targetType: "expense",
        metadata: input,
        ipAddress,
        userAgent,
      });

      return expense;
    }),

  delete: protectedProcedure
    .input(deleteExpenseSchema)
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(expenses)
        .where(
          and(eq(expenses.id, input.id), eq(expenses.userId, ctx.session.user.id))
        );

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();
      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.EXPENSE.DELETE,
        targetId: input.id,
        targetType: "expense",
        ipAddress,
        userAgent,
      });

      return { success: true };
    }),
});
