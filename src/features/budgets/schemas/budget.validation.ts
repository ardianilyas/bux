import { z } from "zod";

/**
 * Validation schemas for budget-related operations
 */

// Pagination schema for list queries
export const budgetListInputSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
});

// Schema for creating a new budget
export const createBudgetSchema = z.object({
  amount: z.number().positive(),
  categoryId: z.string().uuid(),
});

// Schema for updating an existing budget
export const updateBudgetSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive(),
});

// Schema for getting budget by ID
export const getBudgetByIdSchema = z.object({
  id: z.string().uuid(),
});

// Schema for deleting a budget
export const deleteBudgetSchema = z.object({
  id: z.string().uuid(),
});

// Infer types from schemas
export type BudgetListInput = z.infer<typeof budgetListInputSchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type GetBudgetByIdInput = z.infer<typeof getBudgetByIdSchema>;
export type DeleteBudgetInput = z.infer<typeof deleteBudgetSchema>;
