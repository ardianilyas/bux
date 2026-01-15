import { z } from "zod";

export const budgetSchema = z.object({
  categoryId: z.string().min(1, "Please select a category"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    })
    .refine((val) => {
      const num = Number(val);
      return num === Number(num.toFixed(2));
    }, {
      message: "Amount can only have up to 2 decimal places",
    }),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;
