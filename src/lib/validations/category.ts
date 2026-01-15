import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Please enter a valid hex color (e.g., #6366f1)"),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
