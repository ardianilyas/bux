import { createTRPCRouter } from "./init";
import { expenseRouter } from "./routers/expense";
import { categoryRouter } from "./routers/category";
import { budgetRouter } from "./routers/budget";

export const appRouter = createTRPCRouter({
  expense: expenseRouter,
  category: categoryRouter,
  budget: budgetRouter,
});

export type AppRouter = typeof appRouter;
