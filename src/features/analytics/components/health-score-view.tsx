"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { motion } from "framer-motion";

// Circular progress component with modern styling
function CircularProgress({
  value,
  size = 240,
  strokeWidth = 16,
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
      {/* Glow effect */}
      <div
        className="absolute inset-0 blur-2xl opacity-20 rounded-full"
        style={{ backgroundColor: color }}
      />

      {/* Background circle */}
      <svg className="transform -rotate-90 relative z-10" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/10"
        />
        {/* Progress circle with gradient */}
        <defs>
          <linearGradient id={`gradient-${value}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#gradient-${value})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: "easeInOut" }}
          filter="drop-shadow(0 0 8px rgba(99, 102, 241, 0.3))"
        />
      </svg>
    </div>
  );
}

// Enhanced dimension card with modern design
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
  // Determine trend icon
  const getTrendIcon = () => {
    if (score >= 80) return <ArrowUp className="h-3 w-3" />;
    if (score >= 60) return <Minus className="h-3 w-3" />;
    return <ArrowDown className="h-3 w-3" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      <Card className="group relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-background via-background to-muted/20">
        {/* Gradient accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: color }}
        />

        {/* Hover glow effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 blur-2xl"
          style={{ backgroundColor: color }}
        />

        <CardContent className="pt-6 pb-6 relative">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-xl shadow-sm"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground/70 mb-0.5">{title}</h3>
                <div className="flex items-center gap-1.5">
                  <span className="text-3xl font-bold tracking-tight">{score}</span>
                  <div
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {getTrendIcon()}
                    <span>{label}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-muted/30 rounded-lg p-3 border border-border/50">
            <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
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
      <Card className="border-destructive/50 shadow-lg">
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
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Financial Health Score
          </h1>
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
        </div>
        <p className="text-muted-foreground text-lg">
          Your personalized financial wellness indicator
        </p>
      </motion.div>

      {/* Main Score Card - Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Card className="relative overflow-hidden border-none shadow-2xl bg-gradient-to-br from-background via-primary/5 to-background backdrop-blur-xl">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 opacity-50" />

          {/* Radial gradient effect */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle at 30% 50%, ${overallColor}40 0%, transparent 70%)`
            }}
          />

          <CardContent className="pt-12 pb-12 relative">
            <div className="flex flex-col items-center gap-8">
              {/* Circular Gauge with modern styling */}
              <div className="relative">
                <CircularProgress
                  value={overall}
                  size={240}
                  strokeWidth={16}
                  color={overallColor}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="text-center"
                  >
                    <div className="text-6xl font-black bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent mb-1">
                      {overall}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground tracking-wider uppercase">
                      out of 100
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Score Info */}
              <motion.div
                className="text-center space-y-4 max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <Badge
                  className="text-lg px-6 py-2 font-bold shadow-lg"
                  style={{
                    backgroundColor: `${overallColor}20`,
                    color: overallColor,
                    border: `2px solid ${overallColor}40`
                  }}
                >
                  {overallLabel}
                </Badge>

                <p className="text-muted-foreground text-base leading-relaxed">
                  {overall >= 80
                    ? "Your finances are in excellent shape! Keep up the outstanding work and maintain these healthy habits."
                    : overall >= 60
                      ? "You're doing well with your finances, but there's room for growth. Focus on the areas below to improve."
                      : overall >= 40
                        ? "Your financial health needs attention. Review the breakdown below and follow the actionable tips."
                        : "Your finances need immediate attention. Don't worry - small improvements in each area will make a big difference!"
                  }
                </p>

                {!hasData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 rounded-lg border border-amber-200 dark:border-amber-800"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Limited data available. Add expenses, budgets, or savings goals for accurate scoring.
                    </span>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Breakdown Section */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <h2 className="text-2xl font-bold mb-1">Score Breakdown</h2>
          <p className="text-muted-foreground">Detailed analysis across four key dimensions</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          <DimensionCard
            title="Budget Adherence"
            score={breakdown.budgetAdherence.score}
            label={breakdown.budgetAdherence.label}
            tip={breakdown.budgetAdherence.tip}
            color={breakdown.budgetAdherence.color}
            icon={Target}
            delay={1.3}
          />
          <DimensionCard
            title="Savings Progress"
            score={breakdown.savingsProgress.score}
            label={breakdown.savingsProgress.label}
            tip={breakdown.savingsProgress.tip}
            color={breakdown.savingsProgress.color}
            icon={PiggyBank}
            delay={1.4}
          />
          <DimensionCard
            title="Spending Consistency"
            score={breakdown.spendingConsistency.score}
            label={breakdown.spendingConsistency.label}
            tip={breakdown.spendingConsistency.tip}
            color={breakdown.spendingConsistency.color}
            icon={TrendingUp}
            delay={1.5}
          />
          <DimensionCard
            title="Subscription Load"
            score={breakdown.subscriptionLoad.score}
            label={breakdown.subscriptionLoad.label}
            tip={breakdown.subscriptionLoad.tip}
            color={breakdown.subscriptionLoad.color}
            icon={CreditCard}
            delay={1.6}
          />
        </div>
      </div>

      {/* Action Items Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.7 }}
      >
        <Card className="border-none shadow-xl bg-gradient-to-br from-primary/5 via-background to-purple-500/5 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Quick Action Items</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Focus on these areas to improve your score</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(breakdown)
                .filter(([_, dim]) => dim.score < 80)
                .sort((a, b) => a[1].score - b[1].score)
                .slice(0, 3)
                .map(([key, dim], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.8 + index * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 hover:bg-background/80 transition-all duration-300"
                  >
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md"
                      style={{ backgroundColor: dim.color }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground mb-1">
                        {key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {dim.tip}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="flex-shrink-0"
                      style={{ backgroundColor: `${dim.color}20`, color: dim.color }}
                    >
                      {dim.score}
                    </Badge>
                  </motion.div>
                ))
              }
              {Object.values(breakdown).every(dim => dim.score >= 80) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-6 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20"
                >
                  <div className="p-2 rounded-full bg-green-500/20">
                    <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-700 dark:text-green-300 mb-1">
                      Excellent work! All areas performing well! 🎉
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Keep maintaining your healthy financial habits to sustain this great score.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function HealthScoreSkeleton() {
  return (
    <div className="space-y-8 pb-8">
      <div className="text-center space-y-2">
        <Skeleton className="h-10 w-96 mx-auto" />
        <Skeleton className="h-6 w-64 mx-auto" />
      </div>
      <Skeleton className="h-[400px] w-full rounded-2xl" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
          ))}
        </div>
      </div>
      <Skeleton className="h-[250px] w-full rounded-xl" />
    </div>
  );
}
