"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  useSystemStats,
  useUserGrowth,
  useExpenseTrends,
  useRecentActivity,
  useUserEngagement,
  useUserRetention,
  usePlatformActivity,
  useSupportMetrics,
} from "../hooks/use-analytics";
import { formatCurrency } from "@/lib/utils";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdminDashboardView() {
  const { data: platformActivity, isLoading: platformLoading } = usePlatformActivity();
  const [selectedCurrency, setSelectedCurrency] = useState<string | undefined>(undefined);

  // Auto-select top currency when data loads
  useEffect(() => {
    if (platformActivity?.currencies?.[0] && !selectedCurrency) {
      setSelectedCurrency(platformActivity.currencies[0].currency);
    }
  }, [platformActivity, selectedCurrency]);

  const { data: stats, isLoading: statsLoading } = useSystemStats();
  const { data: userGrowth, isLoading: growthLoading } = useUserGrowth();
  const { data: expenseTrends, isLoading: trendsLoading } = useExpenseTrends(selectedCurrency);
  const { data: activity, isLoading: activityLoading } = useRecentActivity();
  const { data: engagement, isLoading: engagementLoading } = useUserEngagement();
  const { data: retention, isLoading: retentionLoading } = useUserRetention();
  const { data: supportMetrics, isLoading: supportLoading } = useSupportMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          System-wide analytics and activity
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers}
          loading={statsLoading}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard
          title="Active Users"
          value={stats?.activeUsers}
          loading={statsLoading}
          subtitle={stats ? `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of total` : undefined}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          }
        />
        <StatCard
          title="Total Expenses"
          value={stats?.totalExpenses?.toLocaleString()}
          loading={statsLoading}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          }
        />
        <StatCard
          title="Top Currency"
          value={platformActivity?.currencies[0] ? formatCurrency(platformActivity.currencies[0].total, platformActivity.currencies[0].currency, true) : undefined}
          loading={platformLoading}
          subtitle={platformActivity?.currencies[0] ? `${platformActivity.currencies[0].currency} (${platformActivity.currencies[0].count} txns)` : undefined}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" x2="12" y1="2" y2="22" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
        <StatCard
          title="Open Tickets"
          value={stats?.openTickets}
          loading={statsLoading}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5v2" />
              <path d="M15 11v2" />
              <path d="M15 17v2" />
              <path d="M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
            </svg>
          }
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">User Growth</CardTitle>
            <p className="text-sm text-muted-foreground">
              New signups over the last 30 days
            </p>
          </CardHeader>
          <CardContent>
            {growthLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ className: "fill-muted-foreground", fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).getDate().toString()}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ className: "fill-muted-foreground", fontSize: 12 }}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number | undefined) => [value ?? 0, "Signups"]}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Trends Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-foreground">Expense Volume</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Daily expense totals over the last 30 days
                </p>
              </div>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  {platformActivity?.currencies.map((curr) => (
                    <SelectItem key={curr.currency} value={curr.currency}>
                      {curr.currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {trendsLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={expenseTrends}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ className: "fill-muted-foreground", fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).getDate().toString()}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ className: "fill-muted-foreground", fontSize: 12 }}
                      width={60}
                      tickFormatter={(value) => formatCurrency(value, selectedCurrency)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number | undefined) => [formatCurrency(value ?? 0, selectedCurrency), "Volume"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorTotal)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Engagement & Retention */}
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="DAU"
            value={engagement?.dau}
            loading={engagementLoading}
            subtitle="Daily Active Users"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            }
          />
          <StatCard
            title="WAU"
            value={engagement?.wau}
            loading={engagementLoading}
            subtitle="Weekly Active Users"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
          <StatCard
            title="7-Day Retention"
            value={retention ? `${Math.round(retention.sevenDayRetention)}%` : undefined}
            loading={retentionLoading}
            subtitle="User return rate"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            }
          />
          <StatCard
            title="30-Day Retention"
            value={retention ? `${Math.round(retention.thirtyDayRetention)}%` : undefined}
            loading={retentionLoading}
            subtitle="Long-term engagement"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
            }
          />
        </div>

        {/* Platform Activity Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Receipt Scanning</CardTitle>
              <p className="text-sm text-muted-foreground">AI-powered expense extraction</p>
            </CardHeader>
            <CardContent>
              {platformLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Scanned</span>
                    <span className="text-lg font-bold text-foreground">
                      {platformActivity?.receiptScanning.scanned ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Manual</span>
                    <span className="text-lg font-bold text-foreground">
                      {((platformActivity?.receiptScanning.total ?? 0) -
                        (platformActivity?.receiptScanning.scanned ?? 0))}
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Scan Rate</span>
                      <span className="text-sm font-semibold text-primary">
                        {Math.round(platformActivity?.receiptScanning.percentage ?? 0)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Top Currencies</CardTitle>
              <p className="text-sm text-muted-foreground">Multi-currency usage</p>
            </CardHeader>
            <CardContent>
              {platformLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="space-y-3">
                  {platformActivity?.currencies.slice(0, 3).map((curr) => (
                    <div key={curr.currency} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {curr.currency}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{curr.count} txns</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {formatCurrency(curr.total, curr.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Savings Goals</CardTitle>
              <p className="text-sm text-muted-foreground">User goal tracking</p>
            </CardHeader>
            <CardContent>
              {platformLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Goals</span>
                    <span className="text-2xl font-bold text-foreground">
                      {platformActivity?.savingsProgress.totalGoals ?? 0}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">Avg Progress</span>
                      <span className="text-sm font-semibold text-primary">
                        {Math.round(platformActivity?.savingsProgress.averageCompletion ?? 0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-green-500 to-emerald-500"
                        style={{ width: `${Math.min(platformActivity?.savingsProgress.averageCompletion ?? 0, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Spending Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Top Spending Categories</CardTitle>
            <p className="text-sm text-muted-foreground">Where users spend the most</p>
          </CardHeader>
          <CardContent>
            {platformLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <div className="space-y-4">
                {platformActivity?.topCategories.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-sm font-medium text-muted-foreground w-4">
                        #{idx + 1}
                      </span>
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: cat.color }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
                          <circle cx="7.5" cy="7.5" r=".5" fill="white" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{cat.count} expenses</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(cat.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Support Performance */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Avg Response Time"
            value={supportMetrics ? `${Math.round(supportMetrics.avgResponseTime)}h` : undefined}
            loading={supportLoading}
            subtitle="First admin reply"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
          />
          <StatCard
            title="Avg Resolution Time"
            value={supportMetrics ? `${Math.round(supportMetrics.avgResolutionTime)}h` : undefined}
            loading={supportLoading}
            subtitle="Ticket close time"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            }
          />
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tickets by Status</CardTitle>
            </CardHeader>
            <CardContent>
              {supportLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <div className="space-y-2">
                  {supportMetrics?.ticketsByStatus.map((status) => (
                    <div key={status.status} className="flex justify-between items-center">
                      <Badge variant={status.status === "open" ? "default" : "secondary"} className="capitalize">
                        {status.status}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">{status.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Signups */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Recent Signups</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {activity?.recentSignups.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {activity?.recentSignups.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent signups</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {activity?.recentTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {ticket.subject}
                      </p>
                      <p className="text-xs text-muted-foreground">by {ticket.userName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={ticket.status === "open" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {activity?.recentTickets.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent tickets</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  loading,
  icon,
}: {
  title: string;
  value?: string | number;
  subtitle?: string;
  loading: boolean;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <>
            <div className="text-2xl font-bold text-foreground">{value ?? 0}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
