import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {
  userListInputSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  updateCurrencySchema,
} from "../schemas";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/features/auth/config/auth";
import { headers } from "next/headers";
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit-logger";
import { USER_STATUS, USER_ROLE } from "@/lib/constants";
import { getRequestMetadata } from "@/lib/request-metadata";

// Helper to check if user has admin privileges
const isAdmin = (role: string) => role === USER_ROLE.ADMIN || role === USER_ROLE.SUPERADMIN;
const isSuperadmin = (role: string) => role === USER_ROLE.SUPERADMIN;

export const userRouter = createTRPCRouter({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Only admins/superadmins can see stats (or maybe all? let's stick to admin for now as it was used in admin table context?)
    // Actually UserStatsCards is imported in... where?
    // It's likely an admin component. The file is in `features/users/components`.
    if (!isAdmin(ctx.session.user.role)) {
      throw new Error("Unauthorized");
    }

    const [total] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    const [active] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.status, "active"));
    const [suspended] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.status, "suspended"));
    const [banned] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.status, "banned"));

    return {
      total: total?.count ?? 0,
      active: active?.count ?? 0,
      suspended: suspended?.count ?? 0,
      banned: banned?.count ?? 0,
    };
  }),

  list: protectedProcedure
    .input(userListInputSchema)
    .query(async ({ ctx, input }) => {
      // Only admins and superadmins can list users
      if (!isAdmin(ctx.session.user.role)) {
        throw new Error("Unauthorized");
      }

      const { page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const data = await db.query.users.findMany({
        orderBy: (users, { desc }) => [desc(users.createdAt)],
        limit: pageSize,
        offset: offset,
      });

      const [totalResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(users);

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

  updateStatus: protectedProcedure
    .input(updateUserStatusSchema)
    .mutation(async ({ ctx, input }) => {
      // Only admins and superadmins can update user status
      if (!isAdmin(ctx.session.user.role)) {
        throw new Error("Unauthorized");
      }

      // Require reason for ban/suspend
      if ((input.status === "banned" || input.status === "suspended") && !input.reason) {
        throw new Error("Reason is required for banning or suspending users");
      }

      // Prevent modifying superadmin status unless you are also superadmin
      const targetUser = await db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });

      if (targetUser?.role === USER_ROLE.SUPERADMIN && !isSuperadmin(ctx.session.user.role)) {
        throw new Error("Cannot modify superadmin status");
      }

      // Calculate expiration date if duration provided
      let statusExpiresAt: Date | null = null;
      if (input.durationDays && input.status !== "active") {
        statusExpiresAt = new Date();
        statusExpiresAt.setDate(statusExpiresAt.getDate() + input.durationDays);
      }

      // Clear reason and expiration when activating
      const statusReason = input.status === "active" ? null : (input.reason || null);
      const expiresAt = input.status === "active" ? null : statusExpiresAt;

      const [updatedUser] = await db
        .update(users)
        .set({
          status: input.status,
          statusReason: statusReason,
          statusExpiresAt: expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.userId))
        .returning();

      // Log the audit event
      const actionMap = {
        [USER_STATUS.BANNED]: AUDIT_ACTIONS.USER.BAN,
        [USER_STATUS.SUSPENDED]: AUDIT_ACTIONS.USER.SUSPEND,
        [USER_STATUS.ACTIVE]: AUDIT_ACTIONS.USER.ACTIVATE,
      };

      const { ipAddress, userAgent } = await getRequestMetadata();

      await logAudit({
        userId: ctx.session.user.id,
        action: actionMap[input.status],
        targetId: input.userId,
        targetType: "user",
        metadata: {
          previousStatus: targetUser?.status,
          newStatus: input.status,
          reason: statusReason,
          expiresAt: expiresAt?.toISOString(),
        },
        ipAddress,
        userAgent,
      });

      return updatedUser;
    }),

  updateRole: protectedProcedure
    .input(updateUserRoleSchema)
    .mutation(async ({ ctx, input }) => {
      // Only superadmins can update user roles
      if (!isSuperadmin(ctx.session.user.role)) {
        throw new Error("Unauthorized: Only superadmins can manage roles");
      }

      // Prevent changing own role
      if (ctx.session.user.id === input.userId) {
        throw new Error("Cannot modify your own role");
      }

      // Prevent modifying another superadmin
      const targetUser = await db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });

      if (targetUser?.role === USER_ROLE.SUPERADMIN) {
        throw new Error("Cannot modify another superadmin's role");
      }

      const previousRole = targetUser?.role;

      const [updatedUser] = await db
        .update(users)
        .set({
          role: input.role,
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.userId))
        .returning();

      // Log the audit event
      const { ipAddress, userAgent } = await getRequestMetadata();

      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.USER.UPDATE_ROLE,
        targetId: input.userId,
        targetType: "user",
        metadata: {
          previousRole,
          newRole: input.role,
        },
        ipAddress,
        userAgent,
      });

      return updatedUser;
    }),

  updateCurrency: protectedProcedure
    .input(updateCurrencySchema)
    .mutation(async ({ ctx, input }) => {
      // Update user currency in database
      const [updatedUser] = await db
        .update(users)
        .set({
          currency: input.currency,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.session.user.id))
        .returning();

      // Update the session on the server to reflect the new currency
      const headersList = await headers();
      await auth.api.updateUser({
        headers: headersList,
        body: {
          currency: input.currency,
        },
      });

      return updatedUser;
    }),
});

