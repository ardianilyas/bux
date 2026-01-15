"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES } from "@/lib/currency";
import { trpc } from "@/trpc/client";
import { useSession } from "@/features/auth/hooks/use-auth";
import { toast } from "sonner";

export function SettingsView() {
  const { data: session, refetch: refetchSession } = useSession();
  const utils = trpc.useUtils();

  const updateCurrency = trpc.user.updateCurrency.useMutation({
    onSuccess: async () => {
      toast.success("Currency updated successfully");
      // Invalidate all queries to refresh data with new currency
      await utils.invalidate();
      // Refresh session to update user currency in UI immediately
      await refetchSession();
      // Force a full page reload to ensure all components re-render
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCurrencyChange = (currency: string) => {
    updateCurrency.mutate({ currency });
  };

  // Type assertion needed because Better Auth types update on server restart
  const userCurrency = (session?.user as any)?.currency || "IDR";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Currency Preference</CardTitle>
          <CardDescription>
            Select your preferred currency for displaying amounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userCurrency && userCurrency !== "IDR" && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-amber-500 shrink-0 mt-0.5"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-500">
                    Important: Currency Changes Affect Display
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Changing your base currency will affect how future expenses are displayed.
                    Existing expenses will use their stored exchange rates, which may not reflect
                    current conversion rates to your new base currency. For accurate historical
                    data, we recommend setting this once and creating new expenses in foreign
                    currencies when needed.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="currency">Default Currency</Label>
            <Select
              value={userCurrency}
              onValueChange={handleCurrencyChange}
              disabled={updateCurrency.isPending}
            >
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{currency.symbol}</span>
                      <span>{currency.code}</span>
                      <span className="text-muted-foreground">- {currency.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              This currency will be used to display all amounts in reports and dashboards.
              New expenses can still be recorded in any currency with real-time conversion.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
