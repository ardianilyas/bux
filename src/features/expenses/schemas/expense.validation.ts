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
  merchant: z.string().optional(),
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
  merchant: z.string().optional(),
});

// Schema for getting expense by ID
export const getExpenseByIdSchema = z.object({
  id: z.string().uuid(),
});

// Schema for deleting an expense
export const deleteExpenseSchema = z.object({
  id: z.string().uuid(),
});

// Schema for calendar data (expenses by month/year)
export const calendarDataInputSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
});

// Infer types from schemas
export type ExpenseListInput = z.infer<typeof expenseListInputSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type GetExpenseByIdInput = z.infer<typeof getExpenseByIdSchema>;
export type DeleteExpenseInput = z.infer<typeof deleteExpenseSchema>;
export type CalendarDataInput = z.infer<typeof calendarDataInputSchema>;
