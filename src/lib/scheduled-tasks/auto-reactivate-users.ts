import { db } from "@/db";
import { users } from "@/db/schema";
import { and, ne, isNotNull, lte, eq } from "drizzle-orm";
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit-logger";

/**
 * Auto-reactivate users whose suspension has expired
 * Called by cron job every hour
 */
export async function autoReactivateExpiredUsers() {
  console.log("[Auto-Reactivate] Starting check for expired suspensions...");

  try {
    // Find users with expired suspensions
    const expiredUsers = await db
      .select()
      .from(users)
      .where(
        and(
          ne(users.status, "active"),
          isNotNull(users.statusExpiresAt),
          lte(users.statusExpiresAt, new Date())
        )
      );

    console.log(`[Auto-Reactivate] Found ${expiredUsers.length} expired suspension(s)`);

    if (expiredUsers.length === 0) {
      return { success: true, reactivatedCount: 0 };
    }

    // Reactivate each user
    for (const user of expiredUsers) {
      await db
        .update(users)
        .set({
          status: "active",
          statusReason: null,
          statusExpiresAt: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      // Log audit event
      await logAudit({
        userId: "system", // System-initiated action
        action: AUDIT_ACTIONS.USER.ACTIVATE,
        targetId: user.id,
        targetType: "user",
        metadata: {
          previousStatus: user.status,
          newStatus: "active",
          reason: "Automatic reactivation - suspension expired",
          expiredAt: user.statusExpiresAt?.toISOString(),
        },
        ipAddress: undefined,
        userAgent: undefined,
      });

      console.log(`[Auto-Reactivate] Reactivated user: ${user.email}`);
    }

    return {
      success: true,
      reactivatedCount: expiredUsers.length,
      users: expiredUsers.map((u) => ({ id: u.id, email: u.email })),
    };
  } catch (error) {
    console.error("[Auto-Reactivate] Error:", error);
    throw error;
  }
}
