"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

interface Budget {
  id: string;
  amount: number;
  spent: number;
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
}

interface DashboardBudgetOverviewProps {
  budgets: Budget[];
  userBaseCurrency: string;
}

export function DashboardBudgetOverview({ budgets, userBaseCurrency }: DashboardBudgetOverviewProps) {
  if (!budgets || budgets.length === 0) return null;

  // Calculate totals
  const totalBudget = budgets.reduce((acc, b) => acc + b.amount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + (b.spent || 0), 0);
  const totalPercent = Math.min((totalSpent / totalBudget) * 100, 100);
  const totalLeft = Math.max(totalBudget - totalSpent, 0);

  // Sort by highest percentage spent to show most critical first
  const sortedBudgets = [...budgets].sort((a, b) => {
    const aPercent = (a.spent || 0) / a.amount;
    const bPercent = (b.spent || 0) / b.amount;
    return bPercent - aPercent;
  }).slice(0, 4); // Show top 4

  const getStatusColor = (percent: number) => {
    if (percent >= 100) return "text-red-500";
    if (percent >= 80) return "text-amber-500";
    return "text-emerald-500";
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return "bg-red-500";
    if (percent >= 80) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <Card className="col-span-full border-zinc-200/50 dark:border-zinc-800/50 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-900/10 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30">
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Monthly Budgets</CardTitle>
            <p className="text-xs text-muted-foreground">Track your spending limits</p>
          </div>
        </div>
        <Link
          href="/dashboard/budgets"
          className="group flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors pr-1"
        >
          View detailed report
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Summary Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-5 rounded-2xl bg-linear-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Total Budget</span>
                {totalPercent >= 100 ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-full">
                    <AlertCircle className="h-3 w-3" /> Over Budget
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> On Track
                  </span>
                )}
              </div>

              <div className="mb-1">
                <span className="text-3xl font-bold tracking-tight">
                  {formatCurrency(totalSpent, userBaseCurrency)}
                </span>
                <span className="text-muted-foreground text-sm ml-1">
                  / {formatCurrency(totalBudget, userBaseCurrency)}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(totalPercent)}`}
                    style={{ width: `${totalPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{Math.round(totalPercent)}% used</span>
                  <span>{formatCurrency(totalLeft, userBaseCurrency)} left</span>
                </div>
              </div>
            </div>
          </div>

          {/* Individual Budgets Grid - 2x2 */}
          <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
            {sortedBudgets.map((budget) => {
              const spent = budget.spent || 0;
              const percent = Math.min((spent / budget.amount) * 100, 100);
              const isOver = percent >= 100;

              return (
                <div
                  key={budget.id}
                  className="group relative p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-sm ring-1 ring-black/5"
                        style={{ backgroundColor: budget.category.color }}
                      >
                        {/* We'll use a generic icon if none provided or map it later, for now just first letter if no icon mapping system */}
                        <span className="text-sm font-bold uppercase">{budget.category.name.substring(0, 2)}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm line-clamp-1">{budget.category.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(budget.amount, userBaseCurrency)} limit
                        </p>
                      </div>
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded-md ${isOver ? 'bg-red-50 text-red-600 dark:bg-red-950/30' : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-800'}`}>
                      {Math.round(percent)}%
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        {formatCurrency(spent, userBaseCurrency)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getProgressColor(percent)}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
