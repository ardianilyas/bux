"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useHealthScore } from "../hooks/use-health-score";
import { Heart, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

// Mini circular progress for the widget
function MiniCircularProgress({
  value,
  color,
  size = 64
}: {
  value: number;
  color: string;
  size?: number;
}) {
  const strokeWidth = 5;
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
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
        {value}
      </div>
    </div>
  );
}

export function HealthScoreWidget() {
  const { data, isLoading, error } = useHealthScore();

  if (isLoading) {
    return (
      <Card className="hover:border-pink-500/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return null; // Hide widget on error
  }

  const { overall, overallLabel, overallColor } = data;

  return (
    <Link href="/dashboard/health">
      <Card className="hover:border-pink-500/50 hover:shadow-md transition-all cursor-pointer group overflow-hidden relative">
        <div
          className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
          style={{
            background: `radial-gradient(circle at 0% 50%, ${overallColor} 0%, transparent 60%)`
          }}
        />
        <CardContent className="p-4 relative">
          <div className="flex items-center gap-4">
            <MiniCircularProgress value={overall} color={overallColor} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <Heart className="h-3.5 w-3.5 text-pink-500" />
                <span className="text-xs font-medium text-muted-foreground">Financial Health</span>
              </div>
              <Badge
                className="text-sm font-semibold"
                style={{ backgroundColor: `${overallColor}20`, color: overallColor }}
              >
                {overallLabel}
              </Badge>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
