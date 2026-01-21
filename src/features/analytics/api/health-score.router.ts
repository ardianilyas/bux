import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { expenses, budgets, savingsGoals, subscriptions } from "@/db/schema";
import { sql, eq, and, gte, lte } from "drizzle-orm";

// Score calculation weights (25% each)
const WEIGHTS = {
  budgetAdherence: 0.25,
  savingsProgress: 0.25,
  spendingConsistency: 0.25,
  subscriptionLoad: 0.25,
};

// Score thresholds for labels
function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Needs Work";
  return "Critical";
}

function getScoreColor(score: number): string {
  if (score >= 90) return "#22c55e"; // green-500
  if (score >= 75) return "#84cc16"; // lime-500
  if (score >= 60) return "#eab308"; // yellow-500
  if (score >= 40) return "#f97316"; // orange-500
  return "#ef4444"; // red-500
}

interface DimensionScore {
  score: number;
  label: string;
  tip: string;
  color: string;
}

interface HealthScoreResult {
  overall: number;
  overallLabel: string;
  overallColor: string;
  breakdown: {
    budgetAdherence: DimensionScore;
    savingsProgress: DimensionScore;
    spendingConsistency: DimensionScore;
    subscriptionLoad: DimensionScore;
  };
  hasData: boolean;
}

export const healthScoreRouter = createTRPCRouter({
  /**
   * Calculate the user's financial health score
   */
  getHealthScore: protectedProcedure.query(async ({ ctx }): Promise<HealthScoreResult> => {
    const userId = ctx.session.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // ==================== 1. BUDGET ADHERENCE ====================
    // Get all budgets with their current spending
    const userBudgets = await db.query.budgets.findMany({
      where: eq(budgets.userId, userId),
      with: { category: true },
    });

    let budgetScore = 100; // Default to perfect if no budgets
    let budgetTip = "Set up budgets to track your spending limits!";

    if (userBudgets.length > 0) {
      // Get spending per category for this month
      const categorySpending = await db
        .select({
          categoryId: expenses.categoryId,
          amount: sql<number>`coalesce(sum(${expenses.amount} * ${expenses.exchangeRate}), 0)::numeric`,
        })
        .from(expenses)
        .where(
          and(
            eq(expenses.userId, userId),
            gte(expenses.date, startOfMonth)
          )
        )
        .groupBy(expenses.categoryId);

      const spendingMap = new Map(categorySpending.map(s => [s.categoryId, Number(s.amount)]));

      let totalAdherence = 0;
      let overBudgetCount = 0;
      let worstCategory = "";
      let worstOverspend = 0;

      for (const budget of userBudgets) {
        const spent = spendingMap.get(budget.categoryId) || 0;
        const budgetAmount = budget.amount;

        if (budgetAmount > 0) {
          const adherence = Math.max(0, Math.min(100, (1 - Math.max(0, spent - budgetAmount) / budgetAmount) * 100));
          totalAdherence += adherence;

          if (spent > budgetAmount) {
            overBudgetCount++;
            const overspend = ((spent - budgetAmount) / budgetAmount) * 100;
            if (overspend > worstOverspend) {
              worstOverspend = overspend;
              worstCategory = budget.category?.name || "Unknown";
            }
          }
        }
      }

      budgetScore = Math.round(totalAdherence / userBudgets.length);

      if (overBudgetCount === 0) {
        budgetTip = "Great job! You're staying within all your budgets.";
      } else if (worstCategory) {
        budgetTip = `Reduce ${worstCategory} spending by ${Math.round(worstOverspend)}% to stay on budget.`;
      } else {
        budgetTip = `You're over budget in ${overBudgetCount} ${overBudgetCount === 1 ? 'category' : 'categories'}. Review your spending!`;
      }
    }

    // ==================== 2. SAVINGS PROGRESS ====================
    const userSavings = await db.query.savingsGoals.findMany({
      where: eq(savingsGoals.userId, userId),
    });

    let savingsScore = 100;
    let savingsTip = "Create savings goals to track your progress!";

    if (userSavings.length > 0) {
      let totalProgress = 0;
      let lowProgressGoals: string[] = [];

      for (const goal of userSavings) {
        const progress = goal.targetAmount > 0
          ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
          : 100;
        totalProgress += progress;

        if (progress < 25 && goal.targetDate) {
          // Check if behind schedule
          const daysToGoal = Math.max(0, (new Date(goal.targetDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const expectedProgress = goal.targetDate ?
            Math.min(100, ((now.getTime() - new Date(goal.createdAt).getTime()) /
              (new Date(goal.targetDate).getTime() - new Date(goal.createdAt).getTime())) * 100) : 0;

          if (progress < expectedProgress * 0.5) {
            lowProgressGoals.push(goal.name);
          }
        }
      }

      savingsScore = Math.round(totalProgress / userSavings.length);

      if (savingsScore >= 80) {
        savingsTip = "Excellent savings progress! Keep up the momentum.";
      } else if (lowProgressGoals.length > 0) {
        savingsTip = `"${lowProgressGoals[0]}" needs attention - consider increasing contributions.`;
      } else {
        savingsTip = "Try to increase monthly savings contributions by 10%.";
      }
    }

    // ==================== 3. SPENDING CONSISTENCY ====================
    // Calculate coefficient of variation of daily spending over last 30 days
    const dailySpending = await db
      .select({
        date: sql<string>`date_trunc('day', ${expenses.date})::date`,
        amount: sql<number>`coalesce(sum(${expenses.amount} * ${expenses.exchangeRate}), 0)::numeric`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, thirtyDaysAgo)
        )
      )
      .groupBy(sql`date_trunc('day', ${expenses.date})`);

    let consistencyScore = 100;
    let consistencyTip = "Start tracking expenses to see your spending patterns!";

    if (dailySpending.length >= 7) { // Need at least a week of data
      const amounts = dailySpending.map(d => Number(d.amount));
      const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;

      if (mean > 0) {
        const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
        const stdDev = Math.sqrt(variance);
        const cv = (stdDev / mean) * 100; // Coefficient of variation as percentage

        // Lower CV = more consistent = higher score
        // CV of 0 = 100, CV of 100+ = 0
        consistencyScore = Math.max(0, Math.min(100, Math.round(100 - cv)));

        if (consistencyScore >= 80) {
          consistencyTip = "Your spending is very predictable. Great financial discipline!";
        } else if (consistencyScore >= 60) {
          consistencyTip = "Try spreading large purchases across the month for more stability.";
        } else {
          // Find the highest spending day
          const maxDay = dailySpending.reduce((max, d) => Number(d.amount) > Number(max.amount) ? d : max);
          consistencyTip = `High variance detected. Your peak spending day had ${Math.round(Number(maxDay.amount) / mean)}x the average.`;
        }
      }
    } else if (dailySpending.length > 0) {
      consistencyScore = 50; // Limited data
      consistencyTip = "Keep tracking for a full week to see your consistency score.";
    }

    // ==================== 4. SUBSCRIPTION LOAD ====================
    // Calculate subscription costs vs total spending
    const activeSubscriptions = await db.query.subscriptions.findMany({
      where: and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.isActive, true)
      ),
    });

    // Calculate monthly subscription cost
    let monthlySubscriptionCost = 0;
    for (const sub of activeSubscriptions) {
      switch (sub.billingCycle) {
        case "weekly":
          monthlySubscriptionCost += sub.amount * 4.33;
          break;
        case "yearly":
          monthlySubscriptionCost += sub.amount / 12;
          break;
        default: // monthly
          monthlySubscriptionCost += sub.amount;
      }
    }

    // Get total monthly spending
    const [monthlySpend] = await db
      .select({
        total: sql<number>`coalesce(sum(${expenses.amount} * ${expenses.exchangeRate}), 0)::numeric`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, startOfMonth)
        )
      );

    const totalMonthlySpend = Number(monthlySpend?.total || 0);

    let subscriptionScore = 100;
    let subscriptionTip = "No active subscriptions tracked. Add them to monitor recurring costs!";

    if (activeSubscriptions.length > 0 && totalMonthlySpend > 0) {
      const subscriptionRatio = (monthlySubscriptionCost / totalMonthlySpend) * 100;

      // Ideal: subscriptions < 30% of total spending
      // 0-30% = 100, 30-50% = 70-50, 50-70% = 50-30, 70%+ = 30-0
      if (subscriptionRatio <= 30) {
        subscriptionScore = 100;
        subscriptionTip = "Your subscription costs are well-balanced!";
      } else if (subscriptionRatio <= 50) {
        subscriptionScore = Math.round(100 - (subscriptionRatio - 30) * 1.5);
        subscriptionTip = `Subscriptions are ${Math.round(subscriptionRatio)}% of spending. Consider reviewing unused services.`;
      } else if (subscriptionRatio <= 70) {
        subscriptionScore = Math.round(70 - (subscriptionRatio - 50));
        subscriptionTip = `High subscription load (${Math.round(subscriptionRatio)}%). Cancel unused subscriptions to improve.`;
      } else {
        subscriptionScore = Math.max(0, Math.round(50 - (subscriptionRatio - 70) * 0.5));
        subscriptionTip = `Critical: ${Math.round(subscriptionRatio)}% goes to subscriptions. Immediate review recommended!`;
      }
    } else if (activeSubscriptions.length > 0) {
      subscriptionScore = 80;
      subscriptionTip = `You have ${activeSubscriptions.length} active subscriptions. Track expenses to see their impact.`;
    }

    // ==================== CALCULATE OVERALL SCORE ====================
    const overall = Math.round(
      budgetScore * WEIGHTS.budgetAdherence +
      savingsScore * WEIGHTS.savingsProgress +
      consistencyScore * WEIGHTS.spendingConsistency +
      subscriptionScore * WEIGHTS.subscriptionLoad
    );

    // Determine if user has enough data
    const hasData = userBudgets.length > 0 || userSavings.length > 0 || dailySpending.length > 0 || activeSubscriptions.length > 0;

    return {
      overall,
      overallLabel: getScoreLabel(overall),
      overallColor: getScoreColor(overall),
      breakdown: {
        budgetAdherence: {
          score: budgetScore,
          label: getScoreLabel(budgetScore),
          tip: budgetTip,
          color: getScoreColor(budgetScore),
        },
        savingsProgress: {
          score: savingsScore,
          label: getScoreLabel(savingsScore),
          tip: savingsTip,
          color: getScoreColor(savingsScore),
        },
        spendingConsistency: {
          score: consistencyScore,
          label: getScoreLabel(consistencyScore),
          tip: consistencyTip,
          color: getScoreColor(consistencyScore),
        },
        subscriptionLoad: {
          score: subscriptionScore,
          label: getScoreLabel(subscriptionScore),
          tip: subscriptionTip,
          color: getScoreColor(subscriptionScore),
        },
      },
      hasData,
    };
  }),
});
