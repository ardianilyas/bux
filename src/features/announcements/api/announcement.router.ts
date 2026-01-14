import { z } from "zod";
import { createTRPCRouter, adminProcedure, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { eq, desc, and, lte, or, isNull, gte } from "drizzle-orm";

export const announcementRouter = createTRPCRouter({
  // Admin: List all announcements
  list: adminProcedure.query(async () => {
    return db.query.announcements.findMany({
      orderBy: [desc(announcements.createdAt)],
    });
  }),

  // Admin: Create announcement
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        message: z.string().min(1),
        type: z.enum(["info", "success", "warning", "critical"]),
        isActive: z.boolean().default(true),
        startsAt: z.date().optional(),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [announcement] = await db
        .insert(announcements)
        .values({
          title: input.title,
          message: input.message,
          type: input.type,
          isActive: input.isActive,
          startsAt: input.startsAt || new Date(),
          expiresAt: input.expiresAt,
          userId: ctx.session.user.id,
        })
        .returning();
      return announcement;
    }),

  // Admin: Update announcement
  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).optional(),
        message: z.string().min(1).optional(),
        type: z.enum(["info", "success", "warning", "critical"]).optional(),
        isActive: z.boolean().optional(),
        startsAt: z.date().optional(),
        expiresAt: z.date().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const [announcement] = await db
        .update(announcements)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(announcements.id, id))
        .returning();
      return announcement;
    }),

  // Admin: Delete announcement
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await db.delete(announcements).where(eq(announcements.id, input.id));
      return { success: true };
    }),

  // User: Get active announcements
  getActive: protectedProcedure.query(async () => {
    const now = new Date();
    return db.query.announcements.findMany({
      where: and(
        eq(announcements.isActive, true),
        lte(announcements.startsAt, now),
        or(isNull(announcements.expiresAt), gte(announcements.expiresAt, now))
      ),
      orderBy: [desc(announcements.createdAt)],
    });
  }),
});
