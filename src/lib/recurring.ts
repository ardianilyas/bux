import { db } from "@/db";
import { subscriptions, expenses } from "@/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit-logger";

// Maximum number of catch-up expenses to create per subscription
const MAX_CATCHUP_EXPENSES = 12;

interface ProcessResult {
  subscriptionId: string;
  subscriptionName: string;
  expensesCreated: number;
  newNextBillingDate: Date;
}

/**
 * Calculate the next billing date based on the current date and billing cycle
 */
function calculateNextBillingDate(
  currentDate: Date,
  billingCycle: "weekly" | "monthly" | "yearly"
): Date {
  const next = new Date(currentDate);

  switch (billingCycle) {
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
}

/**
 * Process all due subscriptions for a specific user
 * Creates expenses for each missed billing period (with a cap)
 */
export async function processUserSubscriptions(userId: string): Promise<ProcessResult[]> {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today

  // Find all active subscriptions that are due
  const dueSubscriptions = await db.query.subscriptions.findMany({
    where: and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.isActive, true),
      lte(subscriptions.nextBillingDate, today)
    ),
  });

  const results: ProcessResult[] = [];

  for (const subscription of dueSubscriptions) {
    let currentBillingDate = new Date(subscription.nextBillingDate);
    let expensesCreated = 0;

    // Create expenses for each missed period (up to the cap)
    while (currentBillingDate <= today && expensesCreated < MAX_CATCHUP_EXPENSES) {
      // Create expense for this billing period
      await db.insert(expenses).values({
        amount: subscription.amount,
        description: `Subscription: ${subscription.name}`,
        date: currentBillingDate,
        categoryId: subscription.categoryId,
        userId: subscription.userId,
        subscriptionId: subscription.id,
      });

      expensesCreated++;

      // Move to next billing date
      currentBillingDate = calculateNextBillingDate(
        currentBillingDate,
        subscription.billingCycle as "weekly" | "monthly" | "yearly"
      );
    }

    // Update subscription with the new next billing date
    await db
      .update(subscriptions)
      .set({
        nextBillingDate: currentBillingDate,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id));

    results.push({
      subscriptionId: subscription.id,
      subscriptionName: subscription.name,
      expensesCreated,
      newNextBillingDate: currentBillingDate,
    });

    // Log audit event
    await logAudit({
      userId,
      action: AUDIT_ACTIONS.SUBSCRIPTION.PROCESS,
      targetId: subscription.id,
      targetType: "subscription",
      metadata: {
        subscriptionName: subscription.name,
        expensesCreated,
        amount: subscription.amount,
        newNextBillingDate: currentBillingDate.toISOString(),
      },
    });
  }

  return results;
}

/**
 * Process all due subscriptions system-wide (for cron job)
 * Returns summary of all processed subscriptions
 */
export async function processAllDueSubscriptions(): Promise<{
  usersProcessed: number;
  totalExpensesCreated: number;
  subscriptionsProcessed: number;
}> {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // Find all active subscriptions that are due
  const dueSubscriptions = await db.query.subscriptions.findMany({
    where: and(
      eq(subscriptions.isActive, true),
      lte(subscriptions.nextBillingDate, today)
    ),
  });

  // Group by user
  const userSubscriptions = new Map<string, typeof dueSubscriptions>();
  for (const sub of dueSubscriptions) {
    const existing = userSubscriptions.get(sub.userId) || [];
    existing.push(sub);
    userSubscriptions.set(sub.userId, existing);
  }

  let totalExpensesCreated = 0;
  let subscriptionsProcessed = 0;

  for (const userId of userSubscriptions.keys()) {
    const results = await processUserSubscriptions(userId);
    for (const result of results) {
      totalExpensesCreated += result.expensesCreated;
      subscriptionsProcessed++;
    }
  }

  return {
    usersProcessed: userSubscriptions.size,
    totalExpensesCreated,
    subscriptionsProcessed,
  };
}
