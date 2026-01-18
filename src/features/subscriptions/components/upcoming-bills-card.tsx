"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Check, CalendarClock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";

export function UpcomingBillsCard() {
  const utils = trpc.useUtils();
  const { data: upcoming, isLoading } = trpc.subscription.getUpcoming.useQuery();
  const mutation = trpc.subscription.recordPayment.useMutation({
    onSuccess: () => {
      toast.success("Bill recorded permanently");
      utils.subscription.getUpcoming.invalidate();
      utils.subscription.list.invalidate();
      utils.expense.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleRecord = (id: string, date: Date) => {
    setProcessingId(id);
    mutation.mutate({ id, date }, {
      onSettled: () => setProcessingId(null)
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bills</CardTitle>
          <CardDescription>Recurring payments due this week</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasBills = upcoming && upcoming.length > 0;

  return (
    <Card className="flex flex-col h-full border-zinc-200/50 dark:border-zinc-800/50 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-900/10 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/30">
            <CalendarClock className="h-4 w-4 text-orange-500" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Upcoming Bills</CardTitle>
            <p className="text-xs text-muted-foreground">
              {hasBills
                ? `${upcoming.length} payment${upcoming.length > 1 ? 's' : ''} due soon`
                : "No bills due this week"}
            </p>
          </div>
        </div>
        <Link href="/dashboard/subscriptions" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
          Manage
        </Link>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        {hasBills ? (
          <ScrollArea className="h-[300px] px-6 pb-6">
            <div className="space-y-3 pt-2">
              {upcoming.map((sub) => {
                const dueDate = new Date(sub.nextBillingDate);
                const daysUntil = differenceInDays(dueDate, new Date());
                const isToday = daysUntil === 0;

                return (
                  <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate max-w-[120px]" title={sub.name}>{sub.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(sub.amount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant={isToday ? "destructive" : "secondary"} className="h-5 px-1.5 font-normal">
                          {isToday ? "Due Today" : `Due in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`}
                        </Badge>
                        <span className="text-muted-foreground">{format(dueDate, "MMM d")}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-2 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={processingId === sub.id}
                      onClick={() => handleRecord(sub.id, new Date())}
                    >
                      {processingId === sub.id ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                      Pay
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground h-full">
            <Check className="h-8 w-8 mb-2 opacity-20" />
            <p>You're all caught up!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
