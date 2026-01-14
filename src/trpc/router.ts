import { createTRPCRouter } from "./init";
import { expenseRouter } from "@/features/expenses/api/expense.router";
import { categoryRouter } from "@/features/categories/api/category.router";
import { budgetRouter } from "@/features/budgets/api/budget.router";
import { receiptRouter } from "@/features/receipts/api/receipt.router";
import { userRouter } from "@/features/users/api/user.router";
import { announcementRouter } from "@/features/announcements/api/announcement.router";

export const appRouter = createTRPCRouter({
  expense: expenseRouter,
  category: categoryRouter,
  budget: budgetRouter,
  receipt: receiptRouter,
  user: userRouter,
  announcement: announcementRouter,
});

export type AppRouter = typeof appRouter;

