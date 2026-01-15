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
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
