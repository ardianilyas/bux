import { z } from "zod";

/**
 * Validation schemas for subscription-related operations
 */

// Pagination schema for list queries
export const subscriptionListInputSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
});

// Schema for creating a new subscription
export const createSubscriptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("IDR"),
  billingCycle: z.enum(["monthly", "yearly"]),
  startDate: z.date(),
  categoryId: z.string().uuid().optional(),
  isActive: z.boolean().optional().default(true),
});

// Schema for updating an existing subscription
export const updateSubscriptionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  billingCycle: z.enum(["monthly", "yearly"]).optional(),
  startDate: z.date().optional(),
  categoryId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional(),
});

// Schema for getting subscription by ID
export const getSubscriptionByIdSchema = z.object({
  id: z.string().uuid(),
});

// Schema for deleting a subscription
export const deleteSubscriptionSchema = z.object({
  id: z.string().uuid(),
});

// Infer types from schemas
export type SubscriptionListInput = z.infer<typeof subscriptionListInputSchema>;
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type GetSubscriptionByIdInput = z.infer<typeof getSubscriptionByIdSchema>;
export type DeleteSubscriptionInput = z.infer<typeof deleteSubscriptionSchema>;
