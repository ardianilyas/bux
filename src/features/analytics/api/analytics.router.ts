import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/trpc/init";
import { db } from "@/db";
import { users, expenses, tickets } from "@/db/schema";
import { sql, desc, gte, and, eq } from "drizzle-orm";

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

    // Get total expense volume
    const [expenseVolume] = await db
      .select({ total: sql<number>`coalesce(sum(amount), 0)::numeric` })
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
      totalVolume: Number(expenseVolume?.total ?? 0),
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
  getExpenseTrends: adminProcedure.query(async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await db
      .select({
        date: sql<string>`date_trunc('day', ${expenses.date})::date`,
        count: sql<number>`count(*)::int`,
        total: sql<number>`coalesce(sum(amount), 0)::numeric`,
      })
      .from(expenses)
      .where(gte(expenses.date, thirtyDaysAgo))
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
});
