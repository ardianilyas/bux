"use client";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { FeatureToggle } from "@/db/schema";
import {
  PiggyBank,
  Repeat,
  Target,
  Calendar,
  PieChart,
  LucideIcon
} from "lucide-react";
import { useState } from "react";

interface FeatureToggleCardProps {
  feature: FeatureToggle & { updatedByUser?: { name: string; email: string } | null };
  onToggle: (featureKey: string, enabled: boolean) => void;
  isUpdating: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  "pig-money": PiggyBank,
  "repeat": Repeat,
  "target": Target,
  "calendar": Calendar,
  "pie-chart": PieChart,
};

export function FeatureToggleCard({ feature, onToggle, isUpdating }: FeatureToggleCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const Icon = iconMap[feature.icon] || Target;
  const isEnabled = feature.enabled;

  const handleToggle = () => {
    onToggle(feature.featureKey, !isEnabled);
  };

  const lastUpdated = feature.updatedAt
    ? new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(feature.updatedAt))
    : "Never";

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 border-2 ${isEnabled
          ? "border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-br from-white to-emerald-50/30 dark:from-background dark:to-emerald-950/10"
          : "border-border bg-muted/30"
        } hover:shadow-lg ${isHovered ? "scale-[1.02]" : "scale-100"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Status indicator bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 transition-all duration-300 ${isEnabled
            ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500"
            : "bg-muted-foreground/20"
          }`}
      />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${isEnabled
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
                }`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-none mb-1.5">
                {feature.displayName}
              </h3>
              <Badge
                variant="outline"
                className={`text-xs ${isEnabled
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "border-muted-foreground/50 bg-muted text-muted-foreground"
                  }`}
              >
                {isEnabled ? "● Active" : "○ Disabled"}
              </Badge>
            </div>
          </div>

          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={isUpdating}
            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-600"
          />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <CardDescription className="text-sm leading-relaxed mb-4">
          {feature.description}
        </CardDescription>

        {/* Footer metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
          <div>
            <span className="font-medium">Last updated:</span> {lastUpdated}
          </div>
          {feature.updatedByUser && (
            <div className="flex items-center gap-1">
              <span>by</span>
              <span className="font-medium">{feature.updatedByUser.name}</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Shimmer effect on hover */}
      {isHovered && isEnabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none animate-shimmer" />
      )}
    </Card>
  );
}
