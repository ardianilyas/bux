import { createTRPCRouter } from "./init";
import { expenseRouter } from "@/features/expenses/api/expense.router";
import { categoryRouter } from "@/features/categories/api/category.router";
import { budgetRouter } from "@/features/budgets/api/budget.router";
import { receiptRouter } from "@/features/receipts/api/receipt.router";
import { userRouter } from "@/features/users/api/user.router";
import { announcementRouter } from "@/features/announcements/api/announcement.router";
import { subscriptionRouter } from "@/features/subscriptions/api/subscription.router";
import { ticketRouter } from "@/features/tickets/api/ticket.router";

export const appRouter = createTRPCRouter({
  expense: expenseRouter,
  category: categoryRouter,
  budget: budgetRouter,
  receipt: receiptRouter,
  user: userRouter,
  announcement: announcementRouter,
  subscription: subscriptionRouter,
  ticket: ticketRouter,
});

export type AppRouter = typeof appRouter;

