import { createTRPCRouter, adminProcedure, protectedProcedure } from "@/trpc/init";
import {
  announcementListInputSchema,
  getActiveAnnouncementsSchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
  deleteAnnouncementSchema,
} from "../schemas";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { eq, desc, and, lte, or, isNull, gte, sql } from "drizzle-orm";
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit-logger";
import { ANNOUNCEMENT_TYPES } from "@/lib/constants";
import { getRequestMetadata } from "@/lib/request-metadata";

export const announcementRouter = createTRPCRouter({
  list: adminProcedure
    .input(announcementListInputSchema)
    .query(async ({ input }) => {
      const { page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const data = await db.query.announcements.findMany({
        orderBy: [desc(announcements.createdAt)],
        limit: pageSize,
        offset: offset,
      });

      const [totalResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(announcements);

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

  create: adminProcedure
    .input(createAnnouncementSchema)
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

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();
      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.ANNOUNCEMENT.CREATE,
        targetId: announcement.id,
        targetType: "announcement",
        metadata: { title: input.title, type: input.type },
        ipAddress,
        userAgent,
      });

      return announcement;
    }),

  update: adminProcedure
    .input(updateAnnouncementSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [announcement] = await db
        .update(announcements)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(announcements.id, id))
        .returning();

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();
      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.ANNOUNCEMENT.UPDATE,
        targetId: input.id,
        targetType: "announcement",
        metadata: data,
        ipAddress,
        userAgent,
      });

      return announcement;
    }),

  delete: adminProcedure
    .input(deleteAnnouncementSchema)
    .mutation(async ({ ctx, input }) => {
      await db.delete(announcements).where(eq(announcements.id, input.id));

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();
      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.ANNOUNCEMENT.DELETE,
        targetId: input.id,
        targetType: "announcement",
        ipAddress,
        userAgent,
      });

      return { success: true };
    }),

  getActive: protectedProcedure
    .input(getActiveAnnouncementsSchema)
    .query(async ({ input }) => {
      const now = new Date();
      const whereClause = and(
        eq(announcements.isActive, true),
        lte(announcements.startsAt, now),
        or(isNull(announcements.expiresAt), gte(announcements.expiresAt, now))
      );

      const { page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const data = await db.query.announcements.findMany({
        where: whereClause,
        orderBy: [desc(announcements.createdAt)],
        limit: pageSize,
        offset: offset,
      });

      const [totalResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(announcements)
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
});
