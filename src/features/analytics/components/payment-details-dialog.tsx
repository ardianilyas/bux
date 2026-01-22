"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Calendar, CreditCard, Mail, User, CheckCircle2, XCircle, ExternalLink, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Define based on what we likely have or will standardise
export type PaymentDetail = {
  id: string;
  amount: number;
  status: string;
  billingPeriod?: string;
  channelCode?: string;
  referenceId?: string; // external ID
  createdAt: string | Date; // handle both for safety
  userName?: string;
  userEmail?: string;
  metadata?: Record<string, any>; // catch-all for extra info
};

type PaymentDetailsDialogProps = {
  payment: PaymentDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userBaseCurrency: string;
};

export function PaymentDetailsDialog({
  payment,
  open,
  onOpenChange,
  userBaseCurrency,
}: PaymentDetailsDialogProps) {
  if (!payment) return null;

  // Safe date formatting
  const date = new Date(payment.createdAt);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "medium",
  }).format(date);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-xl">
            Payment Details
            <Badge
              variant={payment.status === "SUCCEEDED" ? "default" : payment.status === "FAILED" ? "destructive" : "secondary"}
              className="ml-2"
            >
              {payment.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Transaction ID: <span className="font-mono text-xs">{payment.id.slice(0, 8)}...</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount Section */}
          <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-border/50">
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Total Amount</p>
            <div className="text-4xl font-bold text-foreground mt-1">
              {formatCurrency(payment.amount, userBaseCurrency)}
            </div>
            {payment.billingPeriod && (
              <Badge variant="outline" className="mt-3 capitalize">
                {payment.billingPeriod} Plan
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            {/* User Info */}
            <div className="grid gap-3 p-4 border rounded-lg">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Customer Information
              </h4>
              <Separator />
              <div className="grid grid-cols-[24px_1fr] gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{payment.userName || "Unknown User"}</span>
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{payment.userEmail || "No email"}</span>
              </div>
            </div>

            {/* Payment Meta */}
            <div className="grid gap-3 p-4 border rounded-lg">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Transaction Info
              </h4>
              <Separator />
              <div className="grid grid-cols-[24px_1fr] gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p className="text-xs text-muted-foreground">{formattedDate}</p>
                </div>

                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Payment Method</p>
                  <p className="text-xs text-muted-foreground font-mono">{payment.channelCode || "Unknown"}</p>
                </div>

                {payment.referenceId && (
                  <>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Reference ID</p>
                      <p className="text-xs text-muted-foreground font-mono break-all">{payment.referenceId}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
