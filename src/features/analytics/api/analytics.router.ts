import { createTRPCRouter, adminProcedure } from "@/trpc/init";
import { db } from "@/db";
import { users, expenses, tickets, categories, subscriptions, ticketMessages } from "@/db/schema";
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
});
