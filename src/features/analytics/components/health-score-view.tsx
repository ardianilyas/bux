"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useHealthScore } from "../hooks/use-health-score";
import {
  Target,
  PiggyBank,
  TrendingUp,
  CreditCard,
  Lightbulb,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

// Circular progress component
function CircularProgress({
  value,
  size = 200,
  strokeWidth = 12,
  color = "#6366f1"
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}

// Mini circular progress for breakdown cards
function MiniProgress({
  value,
  color,
  size = 48
}: {
  value: number;
  color: string;
  size?: number;
}) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
        {value}
      </div>
    </div>
  );
}

// Breakdown dimension card
function DimensionCard({
  title,
  score,
  label,
  tip,
  color,
  icon: Icon,
  delay = 0
}: {
  title: string;
  score: number;
  label: string;
  tip: string;
  color: string;
  icon: React.ElementType;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 border-l-4" style={{ borderLeftColor: color }}>
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{title}</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold">{score}</span>
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{tip}</p>
            </div>
            <MiniProgress value={score} color={color} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function HealthScoreView() {
  const { data, isLoading, error } = useHealthScore();

  if (isLoading) {
    return <HealthScoreSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load health score. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { overall, overallLabel, overallColor, breakdown, hasData } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Financial Health</h2>
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">
            Your personalized financial wellness score
          </p>
        </div>
      </div>

      {/* Main Score Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              background: `radial-gradient(circle at 30% 50%, ${overallColor} 0%, transparent 50%)`
            }}
          />
          <CardContent className="pt-8 pb-8 relative">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              {/* Circular Gauge */}
              <div className="relative">
                <CircularProgress
                  value={overall}
                  size={200}
                  strokeWidth={14}
                  color={overallColor}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    className="text-5xl font-bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {overall}
                  </motion.span>
                  <span className="text-sm text-muted-foreground">out of 100</span>
                </div>
              </div>

              {/* Score Info */}
              <div className="text-center md:text-left space-y-3">
                <Badge
                  className="text-lg px-4 py-1 font-semibold"
                  style={{ backgroundColor: `${overallColor}20`, color: overallColor }}
                >
                  {overallLabel}
                </Badge>
                <p className="text-muted-foreground max-w-xs">
                  {overall >= 80
                    ? "Your finances are in great shape! Keep up the excellent work."
                    : overall >= 60
                      ? "You're doing well, but there's room for improvement."
                      : overall >= 40
                        ? "Your financial health needs attention. Review the tips below."
                        : "Your finances need immediate attention. Focus on the critical areas below."
                  }
                </p>
                {!hasData && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Limited data available. Add more expenses, budgets, or savings goals for accurate scoring.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Breakdown Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DimensionCard
          title="Budget Adherence"
          score={breakdown.budgetAdherence.score}
          label={breakdown.budgetAdherence.label}
          tip={breakdown.budgetAdherence.tip}
          color={breakdown.budgetAdherence.color}
          icon={Target}
          delay={0.1}
        />
        <DimensionCard
          title="Savings Progress"
          score={breakdown.savingsProgress.score}
          label={breakdown.savingsProgress.label}
          tip={breakdown.savingsProgress.tip}
          color={breakdown.savingsProgress.color}
          icon={PiggyBank}
          delay={0.2}
        />
        <DimensionCard
          title="Spending Consistency"
          score={breakdown.spendingConsistency.score}
          label={breakdown.spendingConsistency.label}
          tip={breakdown.spendingConsistency.tip}
          color={breakdown.spendingConsistency.color}
          icon={TrendingUp}
          delay={0.3}
        />
        <DimensionCard
          title="Subscription Load"
          score={breakdown.subscriptionLoad.score}
          label={breakdown.subscriptionLoad.label}
          tip={breakdown.subscriptionLoad.tip}
          color={breakdown.subscriptionLoad.color}
          icon={CreditCard}
          delay={0.4}
        />
      </div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Quick Tips to Improve</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {Object.entries(breakdown)
                .filter(([_, dim]) => dim.score < 80)
                .sort((a, b) => a[1].score - b[1].score)
                .slice(0, 3)
                .map(([key, dim]) => (
                  <li key={key} className="flex items-start gap-3 text-sm">
                    <span
                      className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5"
                      style={{ backgroundColor: dim.color }}
                    />
                    <span className="text-muted-foreground">{dim.tip}</span>
                  </li>
                ))
              }
              {Object.values(breakdown).every(dim => dim.score >= 80) && (
                <li className="flex items-start gap-3 text-sm">
                  <span className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5 bg-green-500" />
                  <span className="text-muted-foreground">
                    All areas are performing well! Keep maintaining your healthy financial habits.
                  </span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function HealthScoreSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Skeleton className="h-[280px] w-full" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-[140px] w-full" />
        ))}
      </div>
      <Skeleton className="h-[160px] w-full" />
    </div>
  );
}
