"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Budget } from "../types";
import { getProgressColor } from "../types";
import { formatCurrency } from "@/lib/utils";

type BudgetCardProps = {
  budget: Budget;
  spent: number;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  userBaseCurrency: string;
};

export function BudgetCard({
  budget,
  spent,
  onEdit,
  onDelete,
  isDeleting,
  userBaseCurrency,
}: BudgetCardProps) {
  const percent = Math.min((spent / budget.amount) * 100, 100);
  const overBudget = spent > budget.amount;

  // Determine color status
  let statusColor = "bg-green-500";
  let statusTextColor = "text-green-600 dark:text-green-400";
  let statusBadgeBg = "bg-green-100 dark:bg-green-900/30";
  let statusText = "On Track";

  if (percent >= 100) {
    statusColor = "bg-red-500";
    statusTextColor = "text-red-600 dark:text-red-400";
    statusBadgeBg = "bg-red-100 dark:bg-red-900/30";
    statusText = "Over Budget";
  } else if (percent >= 85) {
    statusColor = "bg-amber-500";
    statusTextColor = "text-amber-600 dark:text-amber-400";
    statusBadgeBg = "bg-amber-100 dark:bg-amber-900/30";
    statusText = "Near Limit";
  }

  return (
    <Card className="hover:border-primary/50 transition-colors group relative overflow-hidden">
      {/* Decorative top border based on status */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${statusColor}`} />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center shadow-sm"
            style={{ backgroundColor: budget.category.color }}
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
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              {budget.category.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {formatCurrency(budget.amount, userBaseCurrency)} Limit
            </p>
          </div>
        </div>
        <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadgeBg} ${statusTextColor}`}>
          {statusText}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2 font-medium">
            <span className="text-foreground">
              {formatCurrency(spent, userBaseCurrency)}
            </span>
            <span
              className={
                overBudget
                  ? "text-red-500"
                  : "text-muted-foreground"
              }
            >
              {Math.round(percent)}%
            </span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${statusColor}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-right">
            {overBudget
              ? `${formatCurrency(spent - budget.amount, userBaseCurrency)} over`
              : `${formatCurrency(budget.amount - spent, userBaseCurrency)} remaining`}
          </p>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="outline" size="sm" onClick={() => onEdit(budget)} className="flex-1 h-8">
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-800"
            onClick={() => onDelete(budget.id)}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function BudgetEmptyState({ hasCategories }: { hasCategories: boolean }) {
  if (!hasCategories) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground mb-4"
          >
            <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
            <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
          </svg>
          <p className="text-muted-foreground text-lg">No categories yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            Create categories first before setting up budgets
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground mb-4"
        >
          <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z" />
          <path d="M2 9v1c0 1.1.9 2 2 2h1" />
          <path d="M16 11h0" />
        </svg>
        <p className="text-muted-foreground text-lg">No budgets yet</p>
        <p className="text-muted-foreground text-sm mt-1">
          Set spending limits for your categories
        </p>
      </CardContent>
    </Card>
  );
}
