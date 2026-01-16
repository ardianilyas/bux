import { z } from "zod";

/**
 * Validation schemas for expense-related operations
 */

// Pagination schema for list queries
export const expenseListInputSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Schema for creating a new expense
export const createExpenseSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1).max(255),
  date: z.coerce.date(),
  categoryId: z.string().uuid().optional(),
  currency: z.string(),
  exchangeRate: z.number().positive(),
});

// Schema for updating an existing expense
export const updateExpenseSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive().optional(),
  description: z.string().min(1).max(255).optional(),
  date: z.coerce.date().optional(),
  categoryId: z.string().uuid().optional().nullable(),
  currency: z.string().optional(),
  exchangeRate: z.number().positive().optional(),
});

// Schema for getting expense by ID
export const getExpenseByIdSchema = z.object({
  id: z.string().uuid(),
});

// Schema for deleting an expense
export const deleteExpenseSchema = z.object({
  id: z.string().uuid(),
});

// Infer types from schemas
export type ExpenseListInput = z.infer<typeof expenseListInputSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type GetExpenseByIdInput = z.infer<typeof getExpenseByIdSchema>;
export type DeleteExpenseInput = z.infer<typeof deleteExpenseSchema>;
