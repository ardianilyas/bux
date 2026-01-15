import { z } from "zod";

export const expenseSchema = z.object({
  description: z
    .string()
    .min(1, "Description is required")
    .max(200, "Description must be less than 200 characters"),
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
  date: z
    .string()
    .min(1, "Date is required")
    .refine((val) => !isNaN(new Date(val).getTime()), {
      message: "Please enter a valid date",
    })
    .refine((val) => new Date(val) <= new Date(), {
      message: "Date cannot be in the future",
    }),
  categoryId: z.string().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
