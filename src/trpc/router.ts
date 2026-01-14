import { createTRPCRouter } from "./init";
import { expenseRouter } from "@/features/expenses/api/expense.router";
import { categoryRouter } from "@/features/categories/api/category.router";
import { budgetRouter } from "@/features/budgets/api/budget.router";

export const appRouter = createTRPCRouter({
  expense: expenseRouter,
  category: categoryRouter,
  budget: budgetRouter,
});

export type AppRouter = typeof appRouter;
