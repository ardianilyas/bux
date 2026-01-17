"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatCurrency } from "@/lib/utils";
import { useSession } from "@/features/auth/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ExpenseData {
  id: string;
  amount: number;
  convertedAmount: number;
  currency: string;
  description: string;
  merchant?: string | null;
  date: Date;
  category: {
    id: string;
    name: string;
    color: string;
    icon?: string | null;
  } | null;
}

interface ExpenseDaySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  expenses: ExpenseData[];
  total: number;
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function ExpenseDaySheet({
  open,
  onOpenChange,
  date,
  expenses,
  total,
}: ExpenseDaySheetProps) {
  const { data: session } = useSession();
  const userBaseCurrency = (session?.user as any)?.currency || "IDR";

  if (!date) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{formatDate(date)}</SheetTitle>
          <p className="text-sm text-muted-foreground">
            {expenses.length} {expenses.length === 1 ? "expense" : "expenses"} •{" "}
            Total: {formatCurrency(total, userBaseCurrency)}
          </p>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No expenses for this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  {/* Category Color Indicator */}
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: expense.category?.color || "#6366f1",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" x2="12" y1="2" y2="22" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>

                  {/* Expense Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-medium text-foreground truncate">
                        {expense.description}
                      </p>
                      <p className="font-semibold text-foreground whitespace-nowrap">
                        -{formatCurrency(expense.convertedAmount, userBaseCurrency)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {expense.category && (
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor: `${expense.category.color}20`,
                            color: expense.category.color,
                            borderColor: `${expense.category.color}40`,
                          }}
                        >
                          {expense.category.name}
                        </Badge>
                      )}
                      {expense.merchant && (
                        <span>• {expense.merchant}</span>
                      )}
                      {expense.currency !== userBaseCurrency && (
                        <span className="text-xs">
                          ({formatCurrency(expense.amount, expense.currency)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
