"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SpendingTrendsChart } from "@/components/charts/spending-trends-chart";
import { CategoryBreakdownChart } from "@/components/charts/category-breakdown-chart";
import { AnnouncementBanner } from "@/features/announcements";
import { useSession } from "@/features/auth/hooks/use-auth";
import { calculateTotalInBaseCurrency } from "@/lib/currency-conversion";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getProgressColor = (percent: number) => {
  if (percent >= 100) return "bg-red-500";
  if (percent >= 80) return "bg-amber-500";
  return "bg-green-500";
};

export function DashboardView() {
  const { data: session } = useSession();
  const userBaseCurrency = (session?.user as any)?.currency || "IDR";

  const { data: expenses, isLoading: expensesLoading } =
    trpc.expense.list.useQuery({ pageSize: 5 }); // Only get recent 5

  const { data: stats, isLoading: statsLoading } = trpc.expense.getStats.useQuery();
  const { data: trends, isLoading: trendsLoading } = trpc.expense.getTrends.useQuery();
  const { data: breakdown, isLoading: breakdownLoading } = trpc.expense.getBreakdown.useQuery();

  const { data: budgetsData } = trpc.budget.list.useQuery({ pageSize: 100 });
  const budgets = budgetsData?.data || [];

  const totalExpenses = stats?.total || 0;
  const thisMonthExpenses = stats?.thisMonth || 0;
  const lastMonthExpenses = stats?.lastMonth || 0;
  const avgPerTransaction = stats?.avgPerTransaction || 0;
  const currentDay = stats?.currentDay || new Date().getDate();
  const daysInMonth = stats?.daysInMonth || 30;
  const recentExpenses = expenses?.data || [];

  // Insights calculations
  const monthlyChange = lastMonthExpenses > 0
    ? Math.round(((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100)
    : 0;

  const dailyRateThisMonth = currentDay > 0 ? thisMonthExpenses / currentDay : 0;
  const predictedMonthEnd = Math.round(dailyRateThisMonth * daysInMonth);

  // Top spending category this month
  const topCategory = breakdown && breakdown.length > 0 ? breakdown[0] : null;

  const isLoading = expensesLoading || statsLoading || trendsLoading || breakdownLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Announcements */}
      <AnnouncementBanner />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-indigo-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-indigo-500"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalExpenses, userBaseCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">Last 6 months</p>
          </CardContent>
        </Card>

        <Card className="hover:border-purple-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-purple-500"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(thisMonthExpenses, userBaseCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>

        <Card className="hover:border-emerald-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transactions
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-emerald-500"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total transactions</p>
          </CardContent>
        </Card>

        <Card className="hover:border-amber-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categories
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-amber-500"
            >
              <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
              <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {breakdown?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {/* Monthly Comparison - Uses dynamic color based on +/- */}
        <Card className={`overflow-hidden border ${monthlyChange >= 0 ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/50' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${monthlyChange >= 0 ? 'bg-red-100 dark:bg-red-900/50' : 'bg-emerald-100 dark:bg-emerald-900/50'}`}>
                {monthlyChange >= 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400">
                    <path d="m5 12 7-7 7 7" /><path d="M12 19V5" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-400">
                    <path d="m5 12 7 7 7-7" /><path d="M12 5v14" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">vs Last Month</p>
                <p className={`text-lg font-bold ${monthlyChange >= 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {monthlyChange >= 0 ? '+' : ''}{monthlyChange}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg per Transaction - Amber/Orange Pastel */}
        <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-400">
                  <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                  <path d="M12 17.5v-11" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg/Transaction</p>
                <p className="text-lg font-bold text-amber-700 dark:text-amber-300">
                  {formatCurrency(avgPerTransaction, userBaseCurrency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Category - Purple/Violet Pastel */}
        <Card className="bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-900/50 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/50">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600 dark:text-violet-400">
                  <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
                  <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Top Category</p>
                <p className="text-lg font-bold text-violet-700 dark:text-violet-300 truncate">
                  {topCategory?.name || 'None'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Predicted Month End - Cyan/Sky Pastel */}
        <Card className="bg-sky-50 border-sky-200 dark:bg-sky-950/30 dark:border-sky-900/50 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/50">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600 dark:text-sky-400">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Predicted Total</p>
                <p className="text-lg font-bold text-sky-700 dark:text-sky-300">
                  {formatCurrency(predictedMonthEnd, userBaseCurrency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <SpendingTrendsChart data={trends || []} userBaseCurrency={userBaseCurrency} />
        <CategoryBreakdownChart data={breakdown || []} userBaseCurrency={userBaseCurrency} />
      </div>

      {/* Budget Overview */}
      {budgets && budgets.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-foreground">Budget Overview</CardTitle>
            <Link
              href="/dashboard/budgets"
              className="text-sm text-primary hover:underline"
            >
              View all →
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {budgets.slice(0, 6).map((budget) => {
                // @ts-ignore - spent is added by backend aggregation
                const spent = budget.spent || 0;
                const percent = Math.min((spent / budget.amount) * 100, 100);
                const overBudget = spent > budget.amount;
                const remaining = Math.max(budget.amount - spent, 0);

                return (
                  <div
                    key={budget.id}
                    className="flex flex-col items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    {/* Circular Progress */}
                    <div className="relative w-16 h-16 mb-2">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="6"
                          className="text-muted"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          strokeWidth="6"
                          strokeLinecap="round"
                          className={overBudget ? "text-red-500" : percent >= 80 ? "text-amber-500" : "text-green-500"}
                          style={{
                            strokeDasharray: `${2 * Math.PI * 28}`,
                            strokeDashoffset: `${2 * Math.PI * 28 * (1 - percent / 100)}`,
                          }}
                          stroke="currentColor"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-xs font-semibold ${overBudget ? "text-red-500" : ""}`}>
                          {Math.round(percent)}%
                        </span>
                      </div>
                    </div>
                    {/* Category */}
                    <div className="flex items-center gap-1.5 mb-1">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: budget.category.color }}
                      />
                      <span className="text-sm font-medium text-foreground truncate max-w-[80px]">
                        {budget.category.name}
                      </span>
                    </div>
                    {/* Amounts */}
                    <p className="text-xs text-muted-foreground text-center">
                      {formatCurrency(remaining, userBaseCurrency)} left
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {recentExpenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No expenses yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start tracking your expenses to see them here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentExpenses.map((expense) => {
                const convertedAmount = expense.amount * expense.exchangeRate;
                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: expense.category?.color || "#6366f1",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" x2="12" y1="2" y2="22" />
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {expense.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {expense.category?.name || "Uncategorized"} •{" "}
                          {formatDate(expense.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        -{formatCurrency(convertedAmount, userBaseCurrency)}
                      </p>
                      {expense.currency !== userBaseCurrency && (
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(expense.amount, expense.currency)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
