import { db } from "@/db";
import { auditLogs } from "@/db/schema";

export type AuditAction =
  | "user.login"
  | "user.logout"
  | "user.ban"
  | "user.suspend"
  | "user.activate"
  | "expense.create"
  | "expense.update"
  | "expense.delete"
  | "category.create"
  | "category.update"
  | "category.delete"
  | "budget.create"
  | "budget.update"
  | "budget.delete"
  | "announcement.create"
  | "announcement.update"
  | "announcement.delete"
  | "ticket.create"
  | "ticket.update"
  | "ticket.close";

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
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not break application flow
    console.error("Failed to create audit log:", error);
  }
}
