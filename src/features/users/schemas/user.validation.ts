import { z } from "zod";

/**
 * Validation schemas for user-related operations
 */

// Pagination schema for list queries
export const userListInputSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  role: z.enum(["user", "admin", "superadmin"]).optional(),
  status: z.enum(["active", "suspended", "banned"]).optional(),
});

// Schema for getting user by ID
export const getUserByIdSchema = z.object({
  id: z.string().uuid(),
});

// Schema for updating user role
export const updateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["user", "admin", "superadmin"]),
});

// Schema for banning user
export const banUserSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().min(1, "Reason is required"),
  duration: z.number().positive().optional(),
});

// Schema for suspending user
export const suspendUserSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().min(1, "Reason is required"),
  duration: z.number().positive().optional(),
});

// Schema for unbanning user
export const unbanUserSchema = z.object({
  userId: z.string().uuid(),
});

// Schema for adding funds to user
export const addFundsSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive("Amount must be positive"),
  reason: z.string().optional(),
});

// Schema for updating user status (ban/suspend/activate)
export const updateUserStatusSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(["active", "suspended", "banned"]),
  reason: z.string().optional(),
  durationDays: z.number().positive().optional(),
});

// Schema for updating user currency preference
export const updateCurrencySchema = z.object({
  currency: z.string().min(3).max(3), // ISO 4217 currency codes
});

// Infer types from schemas
export type UserListInput = z.infer<typeof userListInputSchema>;
export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type UpdateCurrencyInput = z.infer<typeof updateCurrencySchema>;
export type BanUserInput = z.infer<typeof banUserSchema>;
export type SuspendUserInput = z.infer<typeof suspendUserSchema>;
export type UnbanUserInput = z.infer<typeof unbanUserSchema>;
export type AddFundsInput = z.infer<typeof addFundsSchema>;
