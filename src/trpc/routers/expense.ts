import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { db } from "@/db";
import { expenses, categories } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export const expenseRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.query.expenses.findMany({
      where: eq(expenses.userId, ctx.session.user.id),
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
