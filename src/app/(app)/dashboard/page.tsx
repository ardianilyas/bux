"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SpendingTrendsChart } from "@/components/charts/spending-trends-chart";
import { CategoryBreakdownChart } from "@/components/charts/category-breakdown-chart";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { data: expenses, isLoading: expensesLoading } =
    trpc.expense.list.useQuery();
  const { data: categories, isLoading: categoriesLoading } =
    trpc.category.list.useQuery();
  const { data: budgets } = trpc.budget.list.useQuery();

  const totalExpenses =
    expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  const thisMonthExpenses =
    expenses
      ?.filter((expense) => {
        const expenseDate = new Date(expense.date);
        const now = new Date();
        return (
          expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, expense) => sum + expense.amount, 0) || 0;

  const recentExpenses = expenses?.slice(0, 5) || [];

  // Filter expenses for current month for category breakdown
  const currentMonthExpenses = expenses?.filter((expense) => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    return (
      expenseDate.getMonth() === now.getMonth() &&
      expenseDate.getFullYear() === now.getFullYear()
    );
  }) || [];

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  // Calculate current month spending for a category
  const getMonthlySpending = (categoryId: string) => {
    if (!expenses) return 0;
    const now = new Date();
    return expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expense.categoryId === categoryId &&
          expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return "bg-red-500";
    if (percent >= 80) return "bg-amber-500";
    return "bg-emerald-500";
  };

  if (expensesLoading || categoriesLoading) {
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
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
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
              {formatCurrency(thisMonthExpenses)}
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
              {expenses?.length || 0}
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
              {categories?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <SpendingTrendsChart expenses={expenses || []} />
        <CategoryBreakdownChart expenses={currentMonthExpenses} />
      </div>

      {/* Budget Overview */}
      {budgets && budgets.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Budget Overview</CardTitle>
            <Link
              href="/dashboard/budgets"
              className="text-sm text-primary hover:underline"
            >
              View all →
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgets.slice(0, 3).map((budget) => {
                const spent = getMonthlySpending(budget.categoryId);
                const percent = Math.min((spent / budget.amount) * 100, 100);
                const overBudget = spent > budget.amount;

                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: budget.category.color }}
                        />
                        <span className="text-foreground font-medium">
                          {budget.category.name}
                        </span>
                      </div>
                      <span
                        className={
                          overBudget
                            ? "text-red-500 font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${getProgressColor(percent)}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
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
              {recentExpenses.map((expense) => (
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
                      -{formatCurrency(expense.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
