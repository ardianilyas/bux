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

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center"
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
            <CardTitle className="text-lg text-foreground">
              {budget.category.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(budget.amount, userBaseCurrency)} / month
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              {formatCurrency(spent, userBaseCurrency)} spent
            </span>
            <span
              className={
                overBudget
                  ? "text-red-500 font-medium"
                  : "text-muted-foreground"
              }
            >
              {overBudget
                ? `${formatCurrency(spent - budget.amount, userBaseCurrency)} over`
                : `${formatCurrency(budget.amount - spent, userBaseCurrency)} left`}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${getProgressColor(percent)}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(budget)}>
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-600"
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
