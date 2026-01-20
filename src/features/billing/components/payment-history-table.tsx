"use client";

import { Loader2, CreditCard } from "lucide-react";
import { trpc } from "@/trpc/client";
import { cn } from "@/lib/utils";

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PaymentHistoryTable() {
  const { data: paymentHistory, isLoading } = trpc.billing.getPaymentHistory.useQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!paymentHistory || paymentHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-4">
          <CreditCard className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">No payment history yet</p>
        <p className="text-sm text-muted-foreground/70 mt-1">Your transactions will appear here</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2">
            <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Date</th>
            <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Type</th>
            <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Amount</th>
            <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Status</th>
            <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Reference</th>
          </tr>
        </thead>
        <tbody>
          {paymentHistory.map((payment) => (
            <tr key={payment.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
              <td className="py-4 px-3 font-medium">
                {new Date(payment.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="py-4 px-3">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                  {payment.channelCode || payment.type}
                </span>
              </td>
              <td className="py-4 px-3 font-bold">
                {formatPrice(payment.amount)}
              </td>
              <td className="py-4 px-3">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold border",
                    payment.status === "SUCCEEDED"
                      ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                      : payment.status === "FAILED"
                        ? "bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                        : "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
                  )}
                >
                  {payment.status}
                </span>
              </td>
              <td className="py-4 px-3 text-muted-foreground text-xs max-w-[200px] truncate font-mono">
                {payment.referenceId}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
