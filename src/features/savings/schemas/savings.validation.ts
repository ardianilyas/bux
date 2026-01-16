import { z } from "zod";

/**
 * Validation schemas for savings-related operations
 */

// Pagination schema for list queries
export const savingsListInputSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
});

// Schema for creating a new savings goal
export const createSavingsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetAmount: z.number().positive("Target amount must be positive"),
  currentAmount: z.number().min(0).optional().default(0),
  color: z.string().optional().default("#6366f1"),
  targetDate: z.date().optional(),
});

// Schema for updating an existing savings goal
export const updateSavingsSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  targetAmount: z.number().positive().optional(),
  currentAmount: z.number().min(0).optional(),
  color: z.string().optional(),
  targetDate: z.date().optional().nullable(),
});

// Schema for adding funds to savings goal
export const addFundsSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive("Amount must be positive"),
});

// Schema for withdrawing funds from savings goal
export const withdrawFundsSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive("Amount must be positive"),
});

// Schema for getting savings goal by ID
export const getSavingsByIdSchema = z.object({
  id: z.string().uuid(),
});

// Schema for deleting a savings goal
export const deleteSavingsSchema = z.object({
  id: z.string().uuid(),
});

// Infer types from schemas
export type SavingsListInput = z.infer<typeof savingsListInputSchema>;
export type CreateSavingsInput = z.infer<typeof createSavingsSchema>;
export type UpdateSavingsInput = z.infer<typeof updateSavingsSchema>;
export type AddFundsInput = z.infer<typeof addFundsSchema>;
export type WithdrawFundsInput = z.infer<typeof withdrawFundsSchema>;
export type GetSavingsByIdInput = z.infer<typeof getSavingsByIdSchema>;
export type DeleteSavingsInput = z.infer<typeof deleteSavingsSchema>;
