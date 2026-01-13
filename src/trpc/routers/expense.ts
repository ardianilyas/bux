import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { db } from "@/db";
import { expenses, categories } from "@/db/schema";
import { eq, desc, and, ilike, gte, lte } from "drizzle-orm";

export const expenseRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          categoryId: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const filters = [eq(expenses.userId, ctx.session.user.id)];

      if (input?.search) {
        filters.push(ilike(expenses.description, `%${input.search}%`));
      }

      if (input?.categoryId && input.categoryId !== "all") {
        filters.push(eq(expenses.categoryId, input.categoryId));
      }

      if (input?.startDate) {
        filters.push(gte(expenses.date, new Date(input.startDate)));
      }

      if (input?.endDate) {
        // Set end date to end of day
        const end = new Date(input.endDate);
        end.setHours(23, 59, 59, 999);
        filters.push(lte(expenses.date, end));
      }

      return db.query.expenses.findMany({
        where: and(...filters),
        orderBy: [desc(expenses.date)],
        with: {
          category: true,
        },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
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
    .input(
      z.object({
        amount: z.number().positive(),
        description: z.string().min(1).max(255),
        date: z.coerce.date(),
        categoryId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [expense] = await db
        .insert(expenses)
        .values({
          amount: input.amount,
          description: input.description,
          date: input.date,
          categoryId: input.categoryId,
          userId: ctx.session.user.id,
        })
        .returning();

      return expense;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        amount: z.number().positive().optional(),
        description: z.string().min(1).max(255).optional(),
        date: z.coerce.date().optional(),
        categoryId: z.string().uuid().optional().nullable(),
      })
    )
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

      return expense;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(expenses)
        .where(
          and(eq(expenses.id, input.id), eq(expenses.userId, ctx.session.user.id))
        );

      return { success: true };
    }),
});
