import { z } from "zod";

/**
 * Validation schemas for category-related operations
 */

// Pagination schema for list queries
export const categoryListInputSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
});

// Schema for creating a new category
export const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#6366f1"),
  icon: z.string().max(50).optional(),
});

// Schema for updating an existing category
export const updateCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(50).optional(),
});

// Schema for getting category by ID
export const getCategoryByIdSchema = z.object({
  id: z.string().uuid(),
});

// Schema for deleting a category
export const deleteCategorySchema = z.object({
  id: z.string().uuid(),
});

// Infer types from schemas
export type CategoryListInput = z.infer<typeof categoryListInputSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type GetCategoryByIdInput = z.infer<typeof getCategoryByIdSchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;
