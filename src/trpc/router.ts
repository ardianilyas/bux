import { createTRPCRouter } from "./init";
import { expenseRouter } from "@/features/expenses/api/expense.router";
import { categoryRouter } from "@/features/categories/api/category.router";
import { budgetRouter } from "@/features/budgets/api/budget.router";
import { receiptRouter } from "@/features/receipts/api/receipt.router";
import { userRouter } from "@/features/users/api/user.router";
import { announcementRouter } from "@/features/announcements/api/announcement.router";
import { subscriptionRouter } from "@/features/subscriptions/api/subscription.router";
import { ticketRouter } from "@/features/tickets/api/ticket.router";
import { analyticsRouter } from "@/features/analytics/api/analytics.router";
import { auditRouter } from "@/features/audit/api/audit.router";
import { savingsRouter } from "@/features/savings/api/savings.router";
import { featureToggleRouter } from "@/features/feature-toggles/api/feature-toggle.router";
import { billingRouter } from "@/features/billing/api/billing.router";

export const appRouter = createTRPCRouter({
  expense: expenseRouter,
  category: categoryRouter,
  budget: budgetRouter,
  receipt: receiptRouter,
  user: userRouter,
  announcement: announcementRouter,
  subscription: subscriptionRouter,
  ticket: ticketRouter,
  analytics: analyticsRouter,
  audit: auditRouter,
  savings: savingsRouter,
  featureToggle: featureToggleRouter,
  billing: billingRouter,
});

export type AppRouter = typeof appRouter;

