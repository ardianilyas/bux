import { db } from "@/db";
import { auditLogs } from "@/db/schema";

import { AuditAction, AUDIT_ACTIONS } from "./audit-constants";

export { AUDIT_ACTIONS };
export type { AuditAction };

/**
 * Log an audit event to the database
 */
export async function logAudit({
  userId,
  action,
  targetId,
  targetType,
  metadata,
  ipAddress,
  userAgent,
}: {
  userId: string;
  action: AuditAction;
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await db.insert(auditLogs).values({
      userId,
      action,
      targetId,
      targetType,
      metadata: metadata ? JSON.stringify(metadata) : null,
      ipAddress,
      userAgent,
      // Let database handle timestamp with its defaultNow() - it's timezone-aware
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not break application flow
    console.error("Failed to create audit log:", error);
  }
}
