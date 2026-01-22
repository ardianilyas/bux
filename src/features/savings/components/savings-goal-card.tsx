"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SavingsGoal } from "../types";
import { getProgressColor } from "../types";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2, Trophy, MoreVertical, Pin, PinOff, CalendarClock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import confetti from "canvas-confetti";

type SavingsGoalCardProps = {
  goal: SavingsGoal;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (id: string) => void;
  onAddFunds: (goal: SavingsGoal) => void;
  onTogglePin: (goal: SavingsGoal) => void;
  isDeleting: boolean;
  userBaseCurrency: string;
};

export function SavingsGoalCard({
  goal,
  onEdit,
  onDelete,
  onAddFunds,
  onTogglePin,
  isDeleting,
  userBaseCurrency,
}: SavingsGoalCardProps) {
  const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const isComplete = goal.currentAmount >= goal.targetAmount;
  const remaining = goal.targetAmount - goal.currentAmount;
  const prevIsComplete = useRef(isComplete);

  useEffect(() => {
    // Trigger confetti if goal becomes complete
    if (isComplete && !prevIsComplete.current) {
      const end = Date.now() + 1000;
      const colors = [goal.color, "#ffffff"];

      (function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
    prevIsComplete.current = isComplete;
  }, [isComplete, goal.color]);

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
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <Card className="hover:border-primary/50 transition-all hover:shadow-md relative overflow-hidden group">
      {/* Background gradient hint */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${goal.color} 0%, transparent 100%)` }}
      />

      {isComplete && (
        <div className="absolute top-0 right-0 p-3">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full p-1.5 animate-bounce shadow-sm">
            <Trophy className="h-4 w-4" />
          </div>
        </div>
      )}

      {goal.isPinned && !isComplete && (
        <div className="absolute top-0 right-0 p-3">
          <div className="bg-muted text-muted-foreground rounded-full p-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
            <Pin className="h-4 w-4" />
          </div>
        </div>
      )}

      <CardHeader className="flex flex-row items-start gap-4 pb-2">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted/20"
            />
            {/* Progress circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke={goal.color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-bold text-foreground">
              {Math.round(percent)}%
            </span>
          </div>
        </div>

        <div className="space-y-1 flex-1 min-w-0 pr-6">
          <CardTitle className="text-lg text-foreground truncate">{goal.name}</CardTitle>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xl font-bold text-foreground">
              {formatCurrency(goal.currentAmount, userBaseCurrency)}
            </span>
            <span className="text-xs text-muted-foreground">
              of {formatCurrency(goal.targetAmount, userBaseCurrency)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
            <CalendarClock className="h-3 w-3" />
            <span>{getEstimatedCompletion()}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        <div>
          <div className="flex justify-between text-xs mb-1.5 text-muted-foreground">
            <span>Progress</span>
            {goal.targetDate && (
              <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
            )}
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-1000"
              style={{ width: `${percent}%`, backgroundColor: goal.color }}
            />
          </div>
          {!isComplete && (
            <p className="text-xs text-right mt-1.5 text-muted-foreground">
              <span className="font-medium text-foreground">{formatCurrency(remaining, userBaseCurrency)}</span> to go
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1 bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 shadow-sm"
            onClick={() => onAddFunds(goal)}
            disabled={isComplete}
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
              <DropdownMenuItem onClick={() => onTogglePin(goal)}>
                {goal.isPinned ? (
                  <>
                    <PinOff className="mr-2 h-4 w-4" />
                    Unpin form Dashboard
                  </>
                ) : (
                  <>
                    <Pin className="mr-2 h-4 w-4" />
                    Pin to Dashboard
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
    </Card >
  );
}
