"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CreditCard,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  XCircle,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function SubscriptionIncomeView() {
  const { data: incomeStats, isLoading: isLoadingStats } = trpc.analytics.getSubscriptionIncome.useQuery();
  const { data: revenueHistory, isLoading: isLoadingHistory } = trpc.analytics.getRevenueHistory.useQuery();
  const { data: recentPayments, isLoading: isLoadingPayments } = trpc.analytics.getRecentPayments.useQuery({ limit: 10 });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  // Format month for chart
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit" }).format(date);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header with gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5 rounded-3xl blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/25">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Revenue Analytics
            </h1>
          </div>
          <p className="text-muted-foreground ml-14">Track subscription income and payment metrics</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="border-2 hover:border-green-500/20 transition-colors overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            {isLoadingStats ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {formatCurrency(incomeStats?.totalRevenue ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  {incomeStats?.totalPayments ?? 0} transactions
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* MRR */}
        <Card className="border-2 hover:border-blue-500/20 transition-colors overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            {isLoadingStats ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {formatCurrency(incomeStats?.mrr ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-blue-600" />
                  Based on active subscriptions
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* This Month Revenue */}
        <Card className="border-2 hover:border-purple-500/20 transition-colors overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
              <Calendar className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            {isLoadingStats ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {formatCurrency(incomeStats?.monthRevenue ?? 0)}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {incomeStats && incomeStats.growthRate >= 0 ? (
                    <div className="p-1 rounded bg-green-500/10">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    </div>
                  ) : (
                    <div className="p-1 rounded bg-red-500/10">
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    </div>
                  )}
                  <p className={`text-xs font-medium ${incomeStats && incomeStats.growthRate >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {incomeStats?.growthRate ?? 0}% from last month
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Active Subscribers */}
        <Card className="border-2 hover:border-amber-500/20 transition-colors overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">Active Pro Users</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            {isLoadingStats ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {incomeStats?.activeProSubscribers ?? 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-amber-600" />
                  {incomeStats?.paymentSuccessRate ?? 0}% success rate
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-7">
        {/* Revenue Trend Chart */}
        <Card className="col-span-4 border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-purple-600">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue over the last 12 months</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoadingHistory ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={revenueHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
                  <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatMonth}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">Revenue</span>
                                <span className="font-bold text-muted-foreground">
                                  {formatCurrency(payload[0].value as number)}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">Payments</span>
                                <span className="font-bold text-muted-foreground">
                                  {payload[0].payload.count}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    strokeWidth={3}
                    stroke="#10b981"
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Billing Breakdown */}
        <Card className="col-span-3 border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Billing Breakdown</CardTitle>
                <CardDescription>Revenue by billing period</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <div className="space-y-4">
                {incomeStats?.billingBreakdown.map((item) => (
                  <div key={item.billingPeriod} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium capitalize">{item.billingPeriod ?? "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{item.count} subscriptions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(item.total)}</p>
                    </div>
                  </div>
                ))}
                {(!incomeStats?.billingBreakdown || incomeStats.billingBreakdown.length === 0) && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No revenue data available
                  </div>
                )}

                {/* Payment Stats */}
                {incomeStats?.paymentStats && (
                  <div className="pt-4 border-t space-y-2">
                    <p className="text-sm font-medium">Last 30 Days</p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        <span className="text-muted-foreground">Succeeded</span>
                      </div>
                      <span className="font-medium">{incomeStats.paymentStats.succeeded}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-red-600" />
                        <span className="text-muted-foreground">Failed</span>
                      </div>
                      <span className="font-medium">{incomeStats.paymentStats.failed}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments Table */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Latest payment transactions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingPayments ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments && recentPayments.length > 0 ? (
                    recentPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.userName}</p>
                            <p className="text-xs text-muted-foreground">{payment.userEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">{payment.billingPeriod ?? "N/A"}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.channelCode ?? "N/A"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={payment.status === "SUCCEEDED" ? "default" : payment.status === "FAILED" ? "destructive" : "secondary"}
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(payment.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No payment transactions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
