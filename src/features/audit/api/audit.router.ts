import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/trpc/init";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { desc, and, gte, lte, eq, like, or, sql } from "drizzle-orm";

export const auditRouter = createTRPCRouter({
  /**
   * Get paginated list of audit logs with filters
   */
  getLogs: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        userId: z.string().optional(),
        action: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, pageSize, userId, action, startDate, endDate } = input;
      const offset = (page - 1) * pageSize;

      // Build filter conditions
      const conditions = [];
      if (userId) {
        conditions.push(eq(auditLogs.userId, userId));
      }
      if (action) {
        conditions.push(like(auditLogs.action, `%${action}%`));
      }
      if (startDate) {
        conditions.push(gte(auditLogs.createdAt, startDate));
      }
      if (endDate) {
        conditions.push(lte(auditLogs.createdAt, endDate));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get logs with user data
      const logs = await db.query.auditLogs.findMany({
        where: whereClause,
        orderBy: [desc(auditLogs.createdAt)],
        limit: pageSize,
        offset,
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Get total count for pagination
      const [totalResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(auditLogs)
        .where(whereClause);

      const total = totalResult?.count ?? 0;

      return {
        logs,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    }),

  /**
   * Get single audit log by ID
   */
  getLogById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const log = await db.query.auditLogs.findFirst({
        where: eq(auditLogs.id, input.id),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!log) {
        throw new Error("Audit log not found");
      }

      return log;
    }),
});
