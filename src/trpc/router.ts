import { createTRPCRouter } from "./init";
import { expenseRouter } from "./routers/expense";
import { categoryRouter } from "./routers/category";

export const appRouter = createTRPCRouter({
  expense: expenseRouter,
  category: categoryRouter,
});

export type AppRouter = typeof appRouter;
