"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SavingsGoal } from "../types";
import { getProgressColor } from "../types";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2, Trophy, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
    <Card className="hover:border-primary/50 transition-all hover:shadow-md relative overflow-hidden">
      {isComplete && (
        <div className="absolute top-2 right-2">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full p-2">
            <Trophy className="h-4 w-4" />
          </div>
        </div>
      )}
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
            <CardTitle className="text-lg text-foreground pr-10">{goal.name}</CardTitle>
            <p className="text-sm font-medium text-foreground">
              {formatCurrency(goal.currentAmount, userBaseCurrency)}
            </p>
            <p className="text-xs text-muted-foreground">
              of {formatCurrency(goal.targetAmount, userBaseCurrency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
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
            className="flex-1 bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
            onClick={() => onAddFunds(goal)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Funds
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="px-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(goal)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Goal
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(goal.id)}
                disabled={isDeleting}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Goal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
