/**
 * Plan Limit Checker
 * Reusable utility for checking subscription plan limits
 */

import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users, budgets, savingsGoals } from "@/db/schema";
import {
  PLAN_TYPES,
  PLAN_LIMITS,
  BILLING_ERRORS,
  type PlanType,
} from "./billing-constants";

// ==================== Types ====================

export type LimitCheckResult = {
  allowed: boolean;
  currentCount: number;
  limit: number;
  plan: PlanType;
};

// ==================== Check Functions ====================

/**
 * Check if user can create a new budget
 */
export async function checkBudgetLimit(userId: string): Promise<LimitCheckResult> {
  const [user] = await db
    .select({ plan: users.plan })
    .from(users)
    .where(eq(users.id, userId));

  const plan = (user?.plan as PlanType) || PLAN_TYPES.FREE;
  const limit = PLAN_LIMITS[plan].maxBudgets;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(budgets)
    .where(eq(budgets.userId, userId));

  const currentCount = countResult?.count ?? 0;

  return {
    allowed: currentCount < limit,
    currentCount,
    limit,
    plan,
  };
}

/**
 * Check if user can create a new savings goal
 */
export async function checkSavingsLimit(userId: string): Promise<LimitCheckResult> {
  const [user] = await db
    .select({ plan: users.plan })
    .from(users)
    .where(eq(users.id, userId));

  const plan = (user?.plan as PlanType) || PLAN_TYPES.FREE;
  const limit = PLAN_LIMITS[plan].maxSavingsGoals;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(savingsGoals)
    .where(eq(savingsGoals.userId, userId));

  const currentCount = countResult?.count ?? 0;

  return {
    allowed: currentCount < limit,
    currentCount,
    limit,
    plan,
  };
}

// ==================== Enforcement Functions ====================

/**
 * Enforce budget limit - throws TRPCError if over limit
 */
export async function enforceBudgetLimit(userId: string): Promise<void> {
  const result = await checkBudgetLimit(userId);

  if (!result.allowed) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: BILLING_ERRORS.BUDGET_LIMIT_REACHED,
    });
  }
}

/**
 * Enforce savings limit - throws TRPCError if over limit
 */
export async function enforceSavingsLimit(userId: string): Promise<void> {
  const result = await checkSavingsLimit(userId);

  if (!result.allowed) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: BILLING_ERRORS.SAVINGS_LIMIT_REACHED,
    });
  }
}
