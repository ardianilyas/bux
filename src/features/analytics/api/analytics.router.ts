import { createTRPCRouter, adminProcedure } from "@/trpc/init";
import { db } from "@/db";
import { users, expenses, tickets, categories, subscriptions, ticketMessages, payments } from "@/db/schema";
import { sql, desc, gte, and, eq } from "drizzle-orm";
import { z } from "zod";

export const analyticsRouter = createTRPCRouter({
  /**
   * Get system-wide statistics for admin dashboard
   */
  getSystemStats: adminProcedure.query(async () => {
    // Get total users
    const [userCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);

    // Get active users (not suspended/banned)
    const [activeUserCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.status, "active"));

    // Get total expenses
    const [expenseCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(expenses);

    // Get open tickets count
    const [openTicketCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tickets)
      .where(eq(tickets.status, "open"));

    return {
      totalUsers: userCount?.count ?? 0,
      activeUsers: activeUserCount?.count ?? 0,
      totalExpenses: expenseCount?.count ?? 0,
      openTickets: openTicketCount?.count ?? 0,
    };
  }),

  /**
   * Get user growth data for the last 30 days
   */
  getUserGrowth: adminProcedure.query(async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await db
      .select({
        date: sql<string>`date_trunc('day', ${users.createdAt})::date`,
        count: sql<number>`count(*)::int`,
      })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo))
      .groupBy(sql`date_trunc('day', ${users.createdAt})`)
      .orderBy(sql`date_trunc('day', ${users.createdAt})`);

    // Fill in missing days with 0
    const data: { date: string; count: number }[] = [];
    const current = new Date(thirtyDaysAgo);
    const today = new Date();

    while (current <= today) {
      const dateStr = current.toISOString().split("T")[0];
      const found = result.find((r) => r.date === dateStr);
      data.push({
        date: dateStr,
        count: found?.count ?? 0,
      });
      current.setDate(current.getDate() + 1);
    }

    return data;
  }),

  /**
   * Get expense trends for the last 30 days
   */
  getExpenseTrends: adminProcedure.input(z.object({
    currency: z.string().optional(),
  }).optional()).query(async ({ input }) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await db
      .select({
        date: sql<string>`date_trunc('day', ${expenses.date})::date`,
        count: sql<number>`count(*)::int`,
        total: sql<number>`coalesce(sum(amount), 0)::numeric`,
      })
      .from(expenses)
      .where(
        input?.currency
          ? and(gte(expenses.date, thirtyDaysAgo), eq(expenses.currency, input.currency))
          : gte(expenses.date, thirtyDaysAgo)
      )
      .groupBy(sql`date_trunc('day', ${expenses.date})`)
      .orderBy(sql`date_trunc('day', ${expenses.date})`);

    // Fill in missing days with 0
    const data: { date: string; count: number; total: number }[] = [];
    const current = new Date(thirtyDaysAgo);
    const today = new Date();

    while (current <= today) {
      const dateStr = current.toISOString().split("T")[0];
      const found = result.find((r) => r.date === dateStr);
      data.push({
        date: dateStr,
        count: found?.count ?? 0,
        total: Number(found?.total ?? 0),
      });
      current.setDate(current.getDate() + 1);
    }

    return data;
  }),

  /**
   * Get recent activity (signups and tickets)
   */
  getRecentActivity: adminProcedure.query(async () => {
    // Get recent signups
    const recentUsers = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
      limit: 5,
      columns: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Get recent tickets
    const recentTickets = await db.query.tickets.findMany({
      orderBy: [desc(tickets.createdAt)],
      limit: 5,
      with: {
        user: {
          columns: {
            name: true,
          },
        },
      },
    });

    return {
      recentSignups: recentUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
        type: "signup" as const,
      })),
      recentTickets: recentTickets.map((t) => ({
        id: t.id,
        subject: t.subject,
        status: t.status,
        priority: t.priority,
        userName: t.user?.name ?? "Unknown",
        createdAt: t.createdAt,
        type: "ticket" as const,
      })),
    };
  }),

  /**
   * Get user engagement metrics (DAU/WAU)
   */
  getUserEngagement: adminProcedure.query(async () => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // DAU: Users with sessions in last 24h
    const [dauResult] = await db
      .select({ count: sql<number>`count(distinct ${users.id})::int` })
      .from(users)
      .innerJoin(sql`sessions`, sql`sessions.user_id = ${users.id}`)
      .where(sql`sessions.created_at >= ${oneDayAgo}`);

    // WAU: Users with sessions in last 7 days
    const [wauResult] = await db
      .select({ count: sql<number>`count(distinct ${users.id})::int` })
      .from(users)
      .innerJoin(sql`sessions`, sql`sessions.user_id = ${users.id}`)
      .where(sql`sessions.created_at >= ${sevenDaysAgo}`);

    return {
      dau: dauResult?.count ?? 0,
      wau: wauResult?.count ?? 0,
    };
  }),

  /**
   * Get user retention metrics
   */
  getUserRetention: adminProcedure.query(async () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Users who signed up 7-14 days ago
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const [sevenDayCohort] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(
        and(
          gte(users.createdAt, fourteenDaysAgo),
          sql`${users.createdAt} < ${sevenDaysAgo}`
        )
      );

    // Of those, how many had activity in last 7 days
    const [sevenDayActive] = await db
      .select({ count: sql<number>`count(distinct ${users.id})::int` })
      .from(users)
      .innerJoin(sql`sessions`, sql`sessions.user_id = ${users.id}`)
      .where(
        and(
          gte(users.createdAt, fourteenDaysAgo),
          sql`${users.createdAt} < ${sevenDaysAgo}`,
          sql`sessions.created_at >= ${sevenDaysAgo}`
        )
      );

    // Users who signed up 30-60 days ago
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const [thirtyDayCohort] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(
        and(
          gte(users.createdAt, sixtyDaysAgo),
          sql`${users.createdAt} < ${thirtyDaysAgo}`
        )
      );

    // Of those, how many had activity in last 30 days
    const [thirtyDayActive] = await db
      .select({ count: sql<number>`count(distinct ${users.id})::int` })
      .from(users)
      .innerJoin(sql`sessions`, sql`sessions.user_id = ${users.id}`)
      .where(
        and(
          gte(users.createdAt, sixtyDaysAgo),
          sql`${users.createdAt} < ${thirtyDaysAgo}`,
          sql`sessions.created_at >= ${thirtyDaysAgo}`
        )
      );

    const sevenDayTotal = sevenDayCohort?.count ?? 0;
    const sevenDayRetained = sevenDayActive?.count ?? 0;
    const thirtyDayTotal = thirtyDayCohort?.count ?? 0;
    const thirtyDayRetained = thirtyDayActive?.count ?? 0;

    return {
      sevenDayRetention: sevenDayTotal > 0 ? (sevenDayRetained / sevenDayTotal) * 100 : 0,
      thirtyDayRetention: thirtyDayTotal > 0 ? (thirtyDayRetained / thirtyDayTotal) * 100 : 0,
    };
  }),

  /**
   * Get platform activity statistics
   */
  getPlatformActivity: adminProcedure.query(async () => {
    // Receipt scanning usage: expenses with merchant field
    const [totalExpenses] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(expenses);

    const [scannedReceipts] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(expenses)
      .where(sql`${expenses.merchant} is not null`);

    // Top 5 spending categories
    const topCategories = await db
      .select({
        name: categories.name,
        color: categories.color,
        total: sql<number>`coalesce(sum(${expenses.amount}), 0)::numeric`,
        count: sql<number>`count(${expenses.id})::int`,
      })
      .from(categories)
      .leftJoin(expenses, eq(expenses.categoryId, categories.id))
      .groupBy(categories.id, categories.name, categories.color)
      .orderBy(sql`coalesce(sum(${expenses.amount}), 0) desc`)
      .limit(5);

    // Currency distribution
    const currencyBreakdown = await db
      .select({
        currency: expenses.currency,
        count: sql<number>`count(*)::int`,
        total: sql<number>`coalesce(sum(${expenses.amount}), 0)::numeric`,
      })
      .from(expenses)
      .groupBy(expenses.currency)
      .orderBy(sql`count(*) desc`)
      .limit(5);

    // Savings goal progress (average completion %)
    const savingsStats = await db.execute(sql`
      SELECT 
        COALESCE(AVG((current_amount / NULLIF(target_amount, 0)) * 100), 0)::numeric as avg_progress,
        COUNT(*)::int as total_goals
      FROM savings_goals
    `);

    return {
      receiptScanning: {
        total: totalExpenses?.count ?? 0,
        scanned: scannedReceipts?.count ?? 0,
        percentage:
          totalExpenses?.count && totalExpenses.count > 0
            ? ((scannedReceipts?.count ?? 0) / totalExpenses.count) * 100
            : 0,
      },
      topCategories: topCategories.map((c) => ({
        name: c.name,
        color: c.color,
        total: Number(c.total),
        count: c.count,
      })),
      currencies: currencyBreakdown.map((c) => ({
        currency: c.currency,
        count: c.count,
        total: Number(c.total),
      })),
      savingsProgress: {
        averageCompletion: Number((savingsStats as any)?.rows?.[0]?.avg_progress ?? 0),
        totalGoals: (savingsStats as any)?.rows?.[0]?.total_goals ?? 0,
      },
    };
  }),

  /**
   * Get support & ticket performance metrics
   */
  getSupportMetrics: adminProcedure.query(async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Ticket volume over last 30 days
    const ticketVolume = await db
      .select({
        date: sql<string>`date_trunc('day', ${tickets.createdAt})::date`,
        count: sql<number>`count(*)::int`,
      })
      .from(tickets)
      .where(gte(tickets.createdAt, thirtyDaysAgo))
      .groupBy(sql`date_trunc('day', ${tickets.createdAt})`)
      .orderBy(sql`date_trunc('day', ${tickets.createdAt})`);

    // Average time to first response (in hours)
    const firstResponse = await db.execute(sql`
      SELECT 
        COALESCE(
          AVG(
            EXTRACT(EPOCH FROM (
              (SELECT MIN(tm.created_at) 
               FROM ticket_messages tm 
               JOIN users u ON tm.user_id = u.id
               WHERE tm.ticket_id = t.id 
               AND (tm.user_id != t.user_id OR u.role IN ('admin', 'superadmin')))
              - t.created_at
            )) / 3600
          ), 0
        )::numeric as avg_hours
      FROM tickets t
      WHERE t.created_at >= ${thirtyDaysAgo}
    `);

    // Average time to resolution (tickets marked resolved/closed, in hours)
    const resolutionTime = await db.execute(sql`
      SELECT 
        COALESCE(
          AVG(
            EXTRACT(EPOCH FROM (t.updated_at - t.created_at)) / 3600
          ), 0
        )::numeric as avg_hours
      FROM tickets t
      WHERE t.status IN ('resolved', 'closed')
      AND t.created_at >= ${thirtyDaysAgo}
    `);

    // Tickets by category
    const ticketsByCategory = await db
      .select({
        category: tickets.category,
        count: sql<number>`count(*)::int`,
      })
      .from(tickets)
      .where(gte(tickets.createdAt, thirtyDaysAgo))
      .groupBy(tickets.category)
      .orderBy(sql`count(*) desc`);

    // Tickets by status
    const ticketsByStatus = await db
      .select({
        status: tickets.status,
        count: sql<number>`count(*)::int`,
      })
      .from(tickets)
      .groupBy(tickets.status)
      .orderBy(sql`count(*) desc`);

    return {
      ticketVolume,
      avgResponseTime: Number((firstResponse as any)?.rows?.[0]?.avg_hours ?? 0),
      avgResolutionTime: Number((resolutionTime as any)?.rows?.[0]?.avg_hours ?? 0),
      ticketsByCategory,
      ticketsByStatus,
    };
  }),

  /**
   * Get subscription revenue income statistics
   */
  getSubscriptionIncome: adminProcedure.query(async () => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total all-time revenue from successful payments
    const [totalRevenue] = await db
      .select({
        total: sql<number>`coalesce(sum(${payments.amount}), 0)::numeric`,
        count: sql<number>`count(*)::int`,
      })
      .from(payments)
      .where(eq(payments.status, "SUCCEEDED"));

    // Current month revenue
    const [monthRevenue] = await db
      .select({
        total: sql<number>`coalesce(sum(${payments.amount}), 0)::numeric`,
        count: sql<number>`count(*)::int`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.status, "SUCCEEDED"),
          gte(payments.createdAt, firstDayOfMonth)
        )
      );

    // Active Pro subscribers
    const [activeProCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(
        and(
          eq(users.plan, "pro"),
          sql`(${users.planExpiresAt} > ${now} OR ${users.trialEndsAt} > ${now})`
        )
      );

    // Revenue breakdown by billing period
    const billingBreakdown = await db
      .select({
        billingPeriod: payments.billingPeriod,
        total: sql<number>`coalesce(sum(${payments.amount}), 0)::numeric`,
        count: sql<number>`count(*)::int`,
      })
      .from(payments)
      .where(eq(payments.status, "SUCCEEDED"))
      .groupBy(payments.billingPeriod);

    // Payment success rate (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const [paymentStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        succeeded: sql<number>`count(*) filter (where ${payments.status} = 'SUCCEEDED')::int`,
        failed: sql<number>`count(*) filter (where ${payments.status} = 'FAILED')::int`,
      })
      .from(payments)
      .where(gte(payments.createdAt, thirtyDaysAgo));

    // Calculate MRR (Monthly Recurring Revenue)
    // For simplicity, we'll calculate based on active subscriptions * monthly equivalent
    const activeSubscriptions = await db
      .select({
        billingPeriod: payments.billingPeriod,
        count: sql<number>`count(distinct ${payments.userId})::int`,
      })
      .from(payments)
      .innerJoin(users, eq(users.id, payments.userId))
      .where(
        and(
          eq(payments.status, "SUCCEEDED"),
          eq(users.plan, "pro"),
          sql`${users.planExpiresAt} > ${now}`
        )
      )
      .groupBy(payments.billingPeriod);

    // Calculate MRR: monthly subs * 39000 + yearly subs * (399000/12)
    const MONTHLY_PRICE = 39000;
    const YEARLY_PRICE = 399000;
    let mrr = 0;
    activeSubscriptions.forEach((sub) => {
      if (sub.billingPeriod === "monthly") {
        mrr += sub.count * MONTHLY_PRICE;
      } else if (sub.billingPeriod === "yearly") {
        mrr += sub.count * (YEARLY_PRICE / 12);
      }
    });

    // Calculate growth rate (compare this month to last month)
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const [lastMonthRevenue] = await db
      .select({
        total: sql<number>`coalesce(sum(${payments.amount}), 0)::numeric`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.status, "SUCCEEDED"),
          gte(payments.createdAt, firstDayOfLastMonth),
          sql`${payments.createdAt} <= ${lastDayOfLastMonth}`
        )
      );

    const thisMonthTotal = Number(monthRevenue?.total ?? 0);
    const lastMonthTotal = Number(lastMonthRevenue?.total ?? 0);
    const growthRate = lastMonthTotal > 0
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
      : thisMonthTotal > 0 ? 100 : 0;

    return {
      totalRevenue: Number(totalRevenue?.total ?? 0),
      totalPayments: totalRevenue?.count ?? 0,
      monthRevenue: thisMonthTotal,
      monthPayments: monthRevenue?.count ?? 0,
      mrr: Math.round(mrr),
      activeProSubscribers: activeProCount?.count ?? 0,
      growthRate: Number(growthRate.toFixed(2)),
      billingBreakdown: billingBreakdown.map((b) => ({
        billingPeriod: b.billingPeriod,
        total: Number(b.total),
        count: b.count,
      })),
      paymentSuccessRate: paymentStats?.total && paymentStats.total > 0
        ? ((paymentStats.succeeded / paymentStats.total) * 100).toFixed(2)
        : "0",
      paymentStats: {
        total: paymentStats?.total ?? 0,
        succeeded: paymentStats?.succeeded ?? 0,
        failed: paymentStats?.failed ?? 0,
      },
    };
  }),

  /**
   * Get revenue history for the last 12 months
   */
  getRevenueHistory: adminProcedure.query(async () => {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const monthlyRevenue = await db
      .select({
        month: sql<string>`to_char(${payments.createdAt}, 'YYYY-MM')`,
        revenue: sql<number>`coalesce(sum(${payments.amount}), 0)::numeric`,
        count: sql<number>`count(*)::int`,
        newSubscribers: sql<number>`count(distinct ${payments.userId})::int`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.status, "SUCCEEDED"),
          gte(payments.createdAt, twelveMonthsAgo)
        )
      )
      .groupBy(sql`to_char(${payments.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${payments.createdAt}, 'YYYY-MM')`);

    // Fill in missing months with 0
    const data: { month: string; revenue: number; count: number; newSubscribers: number }[] = [];
    const current = new Date(twelveMonthsAgo);

    while (current <= now) {
      const monthStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      const found = monthlyRevenue.find((r) => r.month === monthStr);
      data.push({
        month: monthStr,
        revenue: Number(found?.revenue ?? 0),
        count: found?.count ?? 0,
        newSubscribers: found?.newSubscribers ?? 0,
      });
      current.setMonth(current.getMonth() + 1);
    }

    return data;
  }),

  /**
   * Get recent payment transactions
   */
  getRecentPayments: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
    }).optional())
    .query(async ({ input }) => {
      const limit = input?.limit ?? 20;

      const recentPayments = await db
        .select({
          id: payments.id,
          xenditId: payments.xenditId,
          referenceId: payments.referenceId,
          amount: payments.amount,
          currency: payments.currency,
          status: payments.status,
          billingPeriod: payments.billingPeriod,
          channelCode: payments.channelCode,
          failureCode: payments.failureCode,
          createdAt: payments.createdAt,
          userId: payments.userId,
          userName: users.name,
          userEmail: users.email,
        })
        .from(payments)
        .innerJoin(users, eq(users.id, payments.userId))
        .orderBy(desc(payments.createdAt))
        .limit(limit);

      return recentPayments;
    }),
});
