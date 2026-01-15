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

// Action constants to avoid magic strings
export const AUDIT_ACTIONS = {
  USER: {
    LOGIN: "user.login" as const,
    LOGOUT: "user.logout" as const,
    BAN: "user.ban" as const,
    SUSPEND: "user.suspend" as const,
    ACTIVATE: "user.activate" as const,
  },
  EXPENSE: {
    CREATE: "expense.create" as const,
    UPDATE: "expense.update" as const,
    DELETE: "expense.delete" as const,
  },
  CATEGORY: {
    CREATE: "category.create" as const,
    UPDATE: "category.update" as const,
    DELETE: "category.delete" as const,
  },
  BUDGET: {
    CREATE: "budget.create" as const,
    UPDATE: "budget.update" as const,
    DELETE: "budget.delete" as const,
  },
  ANNOUNCEMENT: {
    CREATE: "announcement.create" as const,
    UPDATE: "announcement.update" as const,
    DELETE: "announcement.delete" as const,
  },
  TICKET: {
    CREATE: "ticket.create" as const,
    UPDATE: "ticket.update" as const,
    CLOSE: "ticket.close" as const,
  },
} as const;

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
