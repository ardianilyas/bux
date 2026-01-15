import { z } from "zod";

export const createSubscriptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be positive"),
  billingCycle: z.enum(["weekly", "monthly", "yearly"]),
  nextBillingDate: z.date(),
  categoryId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
  createExpense: z.boolean().default(false),
});

export const updateSubscriptionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  billingCycle: z.enum(["weekly", "monthly", "yearly"]).optional(),
  nextBillingDate: z.date().optional(),
  categoryId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional(),
});
