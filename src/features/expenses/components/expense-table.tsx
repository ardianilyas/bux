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
import type { Expense } from "../types";

type ExpenseTableProps = {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
};

export function ExpenseTable({
  expenses,
  onEdit,
  onDelete,
  isDeleting,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">All Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-muted-foreground">
                Description
              </TableHead>
              <TableHead className="text-muted-foreground">Category</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground">Amount</TableHead>
              <TableHead className="text-right text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => {
              const convertedAmount = convertToBaseCurrency(expense, userBaseCurrency);
              const isDifferentCurrency = expense.currency !== userBaseCurrency;

              return (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium text-foreground">
                    {expense.description}
                  </TableCell>
                  <TableCell>
                    {expense.category ? (
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: expense.category.color,
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
                  <TableCell className="font-semibold text-foreground">
                    <div>
                      {formatCurrency(convertedAmount, userBaseCurrency)}
                      {isDifferentCurrency && (
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(expense.amount, expense.currency)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(expense)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => onDelete(expense.id)}
                        disabled={isDeleting}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
