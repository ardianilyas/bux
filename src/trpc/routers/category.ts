import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const categoryRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.query.categories.findMany({
      where: eq(categories.userId, ctx.session.user.id),
      orderBy: [categories.name],
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return db.query.categories.findFirst({
        where: and(
          eq(categories.id, input.id),
          eq(categories.userId, ctx.session.user.id)
        ),
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#6366f1"),
        icon: z.string().max(50).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [category] = await db
        .insert(categories)
        .values({
          name: input.name,
          color: input.color,
          icon: input.icon,
          userId: ctx.session.user.id,
        })
        .returning();

      return category;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(50).optional(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        icon: z.string().max(50).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [category] = await db
        .update(categories)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(
          and(eq(categories.id, id), eq(categories.userId, ctx.session.user.id))
        )
        .returning();

      return category;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(categories)
        .where(
          and(
            eq(categories.id, input.id),
            eq(categories.userId, ctx.session.user.id)
          )
        );

      return { success: true };
    }),
});
