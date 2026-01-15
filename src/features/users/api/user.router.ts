import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/features/auth/config/auth";
import { headers } from "next/headers";
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit-logger";
import { USER_STATUS } from "@/lib/constants";
import { getRequestMetadata } from "@/lib/request-metadata";

export const userRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    // Only admins can list users
    if (ctx.session.user.role !== "admin") {
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
      // Only admins can update user status
      if (ctx.session.user.role !== "admin") {
        throw new Error("Unauthorized");
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
