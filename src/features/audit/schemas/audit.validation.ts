import { z } from "zod";

/**
 * Validation schemas for audit-related operations
 */

// Pagination schema for list queries
export const auditListInputSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
  action: z.string().optional(),
  userId: z.string().uuid().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

// Schema for getting audit log by ID
export const getAuditByIdSchema = z.object({
  id: z.string().uuid(),
});

// Infer types from schemas
export type AuditListInput = z.infer<typeof auditListInputSchema>;
export type GetAuditByIdInput = z.infer<typeof getAuditByIdSchema>;
