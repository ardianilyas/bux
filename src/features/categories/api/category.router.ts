import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/trpc/init";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const categoryRouter = createTRPCRouter({
  list: protectedProcedure.query(async () => {
    return db.query.categories.findMany({
      orderBy: [categories.name],
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Allow fetching any category since they are shared
      return db.query.categories.findFirst({
        where: eq(categories.id, input.id),
      });
    }),

  create: adminProcedure
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

  update: adminProcedure
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
          // Ensure admin owns it or can edit it.
          // Since all categories are effectively system/admin categories now, 
          // allow admin to edit any category essentially, or strictly their own.
          // For now, allow editing by ID if admin.
          eq(categories.id, id)
        )
        .returning();

      return category;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await db.delete(categories).where(eq(categories.id, input.id));

      return { success: true };
    }),
});
