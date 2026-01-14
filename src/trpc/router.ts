import { createTRPCRouter } from "./init";
import { expenseRouter } from "@/features/expenses/api/expense.router";
import { categoryRouter } from "@/features/categories/api/category.router";
import { budgetRouter } from "@/features/budgets/api/budget.router";
import { receiptRouter } from "@/features/receipts/api/receipt.router";
import { userRouter } from "@/features/users/api/user.router";

export const appRouter = createTRPCRouter({
  expense: expenseRouter,
  category: categoryRouter,
  budget: budgetRouter,
  receipt: receiptRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

