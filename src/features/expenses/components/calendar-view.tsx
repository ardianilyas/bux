"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useSession } from "@/features/auth/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { ExpenseDaySheet } from "./expense-day-sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function CalendarView() {
  const { data: session } = useSession();
  const userBaseCurrency = (session?.user as any)?.currency || "IDR";

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const currentMonth = currentDate.getMonth() + 1; // 1-based
  const currentYear = currentDate.getFullYear();

  const { data, isLoading } = trpc.expense.getCalendarData.useQuery({
    month: currentMonth,
    year: currentYear,
  });

  // Create a map of dates to expenses for quick lookup
  const expenseMap = useMemo(() => {
    if (!data?.dailyData) return new Map();

    const map = new Map();
    data.dailyData.forEach((day) => {
      map.set(day.date, day);
    });
    return map;
  }, [data]);

  // Get selected day's expenses
  const selectedDayData = useMemo(() => {
    if (!selectedDate) return { expenses: [], total: 0 };

    const dateKey = format(selectedDate, "yyyy-MM-dd");
    const dayData = expenseMap.get(dateKey);

    return {
      expenses: dayData?.expenses || [],
      total: dayData?.total || 0,
    };
  }, [selectedDate, expenseMap]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth - 1, day);
      const dateKey = format(date, "yyyy-MM-dd");
      const dayData = expenseMap.get(dateKey);

      days.push({
        date,
        day,
        hasExpenses: !!dayData,
        expenseCount: dayData?.count || 0,
        total: dayData?.total || 0,
        expenses: dayData?.expenses || [],
      });
    }

    return days;
  }, [currentYear, currentMonth, expenseMap]);

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth, 1));
  };

  const handleDateClick = (dayData: any) => {
    if (dayData && dayData.hasExpenses) {
      setSelectedDate(dayData.date);
      setSheetOpen(true);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:border-indigo-500/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(data?.totalMonthSpending || 0, userBaseCurrency)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:border-purple-500/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {data?.expenseCount || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:border-emerald-500/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Daily Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(
                  data?.expenseCount ? Math.round((data.totalMonthSpending || 0) / new Date(currentYear, currentMonth, 0).getDate()) : 0,
                  userBaseCurrency
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Calendar Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-foreground">
                {MONTHS[currentMonth - 1]} {currentYear}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousMonth}
                disabled={isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                disabled={isLoading}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextMonth}
                disabled={isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((dayData, index) => {
                if (!dayData) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const today = isToday(dayData.date);
                const hasExpenses = dayData.hasExpenses;

                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(dayData)}
                    disabled={!hasExpenses}
                    className={`
                      relative aspect-square rounded-lg border p-2 transition-all
                      ${today ? "border-primary bg-primary/5" : "border-border"}
                      ${hasExpenses
                        ? "hover:border-primary hover:bg-accent cursor-pointer"
                        : "bg-muted/30 cursor-default"
                      }
                      ${!hasExpenses ? "opacity-50" : ""}
                    `}
                  >
                    <div className="flex flex-col h-full">
                      <span className={`text-sm font-medium ${today ? "text-primary" : "text-foreground"}`}>
                        {dayData.day}
                      </span>

                      {hasExpenses && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-1 mt-1">
                          {/* Category color dots */}
                          <div className="flex flex-wrap gap-0.5 justify-center max-w-full">
                            {dayData.expenses.slice(0, 3).map((expense: any, idx: number) => (
                              <div
                                key={idx}
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: expense.category?.color || "#6366f1" }}
                                title={expense.category?.name || "Uncategorized"}
                              />
                            ))}
                            {dayData.expenseCount > 3 && (
                              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                            )}
                          </div>

                          {/* Expense count badge */}
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1 py-0 h-4 min-w-[16px]"
                          >
                            {dayData.expenseCount}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Day Sheet */}
      <ExpenseDaySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        date={selectedDate}
        expenses={selectedDayData.expenses}
        total={selectedDayData.total}
      />
    </div>
  );
}
