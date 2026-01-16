"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SavingsGoal } from "../types";
import { getProgressColor } from "../types";
import { formatCurrency } from "@/lib/utils";

type SavingsGoalCardProps = {
  goal: SavingsGoal;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (id: string) => void;
  onAddFunds: (goal: SavingsGoal) => void;
  isDeleting: boolean;
  userBaseCurrency: string;
};

export function SavingsGoalCard({
  goal,
  onEdit,
  onDelete,
  onAddFunds,
  isDeleting,
  userBaseCurrency,
}: SavingsGoalCardProps) {
  const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const isComplete = goal.currentAmount >= goal.targetAmount;
  const remaining = goal.targetAmount - goal.currentAmount;

  // Calculate estimated completion date
  const getEstimatedCompletion = () => {
    if (isComplete) return "Goal reached! 🎉";
    if (goal.currentAmount <= 0) return "Start saving to see forecast";

    const createdAt = new Date(goal.createdAt);
    const now = new Date();
    const daysSinceCreation = Math.max(1, Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));
    const dailySavingsRate = goal.currentAmount / daysSinceCreation;

    if (dailySavingsRate <= 0) return "Start saving to see forecast";

    const daysToComplete = Math.ceil(remaining / dailySavingsRate);
    const completionDate = new Date(now.getTime() + daysToComplete * 24 * 60 * 60 * 1000);

    return `Est. ${completionDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
  };

  // Circular progress ring
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-4">
          {/* Circular Progress */}
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/30"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={goal.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-foreground">
                {Math.round(percent)}%
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-lg text-foreground">{goal.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(goal.currentAmount, userBaseCurrency)} of{" "}
              {formatCurrency(goal.targetAmount, userBaseCurrency)}
            </p>
            <p className="text-xs text-muted-foreground">
              {getEstimatedCompletion()}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Linear progress bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              {formatCurrency(remaining, userBaseCurrency)} to go
            </span>
            {goal.targetDate && (
              <span className="text-muted-foreground">
                Target: {new Date(goal.targetDate).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${getProgressColor(percent)}`}
              style={{ width: `${percent}%`, backgroundColor: goal.color }}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => onAddFunds(goal)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Add
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(goal)}>
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-600"
            onClick={() => onDelete(goal.id)}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SavingsGoalEmptyState() {
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
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        <p className="text-muted-foreground text-lg">No savings goals yet</p>
        <p className="text-muted-foreground text-sm mt-1">
          Create your first savings goal to start tracking
        </p>
      </CardContent>
    </Card>
  );
}
