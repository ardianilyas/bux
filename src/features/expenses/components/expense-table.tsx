"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useSession } from "@/features/auth/hooks/use-auth";
import { convertToBaseCurrency } from "@/lib/currency-conversion";
import { MoreVertical, Pencil, Trash2, Receipt } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/empty-state";
import type { Expense } from "../types";

type ExpenseTableProps = {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  onAddExpense?: () => void;
};

export function ExpenseTable({
  expenses,
  onEdit,
  onDelete,
  isDeleting,
  onAddExpense,
}: ExpenseTableProps) {
  const { data: session } = useSession();
  const userBaseCurrency = (session?.user as any)?.currency || "IDR";

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No expenses yet"
        description="Start tracking your spending by adding your first expense"
        action={
          onAddExpense ? (
            <Button onClick={onAddExpense}>Add Your First Expense</Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">All Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => {
                const convertedAmount = convertToBaseCurrency(expense, userBaseCurrency);
                const isDifferentCurrency = expense.currency !== userBaseCurrency;

                return (
                  <TableRow key={expense.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {expense.description}
                    </TableCell>
                    <TableCell>
                      {expense.category ? (
                        <Badge
                          variant="outline"
                          className="font-normal"
                          style={{
                            borderColor: expense.category.color,
                            backgroundColor: `${expense.category.color}15`,
                            color: expense.category.color,
                          }}
                        >
                          {expense.category.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(expense.date)}
                    </TableCell>
                    <TableCell className="font-semibold">
                      <div>
                        {formatCurrency(convertedAmount, userBaseCurrency)}
                        {isDifferentCurrency && (
                          <div className="text-xs text-muted-foreground font-normal">
                            {formatCurrency(expense.amount, expense.currency)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(expense)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(expense.id)}
                            disabled={isDeleting}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {expenses.map((expense) => {
          const convertedAmount = convertToBaseCurrency(expense, userBaseCurrency);
          const isDifferentCurrency = expense.currency !== userBaseCurrency;

          return (
            <Card key={expense.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{expense.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {expense.category ? (
                        <Badge
                          variant="outline"
                          className="font-normal text-xs"
                          style={{
                            borderColor: expense.category.color,
                            backgroundColor: `${expense.category.color}15`,
                            color: expense.category.color,
                          }}
                        >
                          {expense.category.name}
                        </Badge>
                      ) : null}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(expense.date)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(convertedAmount, userBaseCurrency)}
                      </p>
                      {isDifferentCurrency && (
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(expense.amount, expense.currency)}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(expense)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(expense.id)}
                          disabled={isDeleting}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
