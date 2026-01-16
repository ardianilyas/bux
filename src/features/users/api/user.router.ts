import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/features/auth/config/auth";
import { headers } from "next/headers";
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit-logger";
import { USER_STATUS, USER_ROLE } from "@/lib/constants";
import { getRequestMetadata } from "@/lib/request-metadata";

// Helper to check if user has admin privileges
const isAdmin = (role: string) => role === USER_ROLE.ADMIN || role === USER_ROLE.SUPERADMIN;
const isSuperadmin = (role: string) => role === USER_ROLE.SUPERADMIN;

export const userRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    // Only admins and superadmins can list users
    if (!isAdmin(ctx.session.user.role)) {
      throw new Error("Unauthorized");
    }

    return db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
  }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        status: z.enum(["active", "suspended", "banned"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only admins and superadmins can update user status
      if (!isAdmin(ctx.session.user.role)) {
        throw new Error("Unauthorized");
      }

      // Prevent modifying superadmin status unless you are also superadmin
      const targetUser = await db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });

      if (targetUser?.role === USER_ROLE.SUPERADMIN && !isSuperadmin(ctx.session.user.role)) {
        throw new Error("Cannot modify superadmin status");
      }

      const [updatedUser] = await db
        .update(users)
        .set({
          status: input.status,
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
          previousStatus: updatedUser.status,
          newStatus: input.status,
        },
        ipAddress,
        userAgent,
      });

      return updatedUser;
    }),

  updateRole: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["user", "admin"]), // Superadmin can only assign user or admin
      })
    )
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
    .input(z.object({ currency: z.string() }))
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

