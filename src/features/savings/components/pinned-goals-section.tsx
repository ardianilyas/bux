"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useSession } from "@/features/auth/hooks/use-auth";
import { Pin, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { PrivacySensitive } from "@/components/privacy-sensitive";

export function PinnedGoalsSection() {
  const { data: session } = useSession();
  const userBaseCurrency = (session?.user as any)?.currency || "IDR";

  const { data: goals } = trpc.savings.list.useQuery({ pageSize: 100 });
  const pinnedGoals = goals?.data.filter(g => g.isPinned) || [];

  if (pinnedGoals.length === 0) return null;

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {pinnedGoals.map((goal) => {
        const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
        return (
          <Card key={goal.id} className="relative overflow-hidden border hover:shadow-md transition-all">
            <div className="absolute top-2 right-2 text-foreground/5 rotate-12">
              <Pin className="h-12 w-12" />
            </div>
            <CardHeader className="pb-2 z-10 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: goal.color }} />
                {goal.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="z-10 relative">
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <PrivacySensitive className="text-2xl font-bold">
                    {formatCurrency(goal.currentAmount, userBaseCurrency)}
                  </PrivacySensitive>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground">of </span>
                    <PrivacySensitive className="text-xs text-muted-foreground" blur={false}>
                      {formatCurrency(goal.targetAmount, userBaseCurrency)}
                    </PrivacySensitive>
                  </div>
                </div>
                <div className="space-y-1">
                  <Progress value={percent} className="h-2" indicatorColor={goal.color} />
                  <p className="text-right text-xs text-muted-foreground">{Math.round(percent)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
