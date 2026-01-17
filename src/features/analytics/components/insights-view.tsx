"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/features/auth/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Store, TrendingUp, CreditCard, ShoppingBag } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function InsightsView() {
  const { data: session } = useSession();
  const userBaseCurrency = (session?.user as any)?.currency || "IDR";
  const { theme } = useTheme();

  // Dynamic color for charts based on theme
  const [axisColor, setAxisColor] = useState("#888888");
  useEffect(() => {
    // Check for dark mode preference (system or explicit)
    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setAxisColor(isDark ? "#ffffff" : "#0f172a"); // White for dark mode, Slate-900 for light
  }, [theme]);

  const { data: merchantStats, isLoading } = trpc.expense.getMerchantStats.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const topMerchants = merchantStats?.bySpend || [];
  const topMerchantsCount = merchantStats?.byCount || [];
  const totalMerchants = merchantStats?.totalMerchants || 0;

  // Calculate summary stats
  const topSpender = topMerchants[0];
  const totalSpend = topMerchants.reduce((acc, curr) => acc + curr.total, 0);
  const totalTx = topMerchants.reduce((acc, curr) => acc + curr.count, 0);
  const avgTransaction = totalTx > 0 ? totalSpend / totalTx : 0;

  // Colors for charts
  const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#64748b"];

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover/90 backdrop-blur-sm border border-border p-3 rounded-lg shadow-xl text-sm z-50">
          <p className="font-semibold text-foreground mb-1">{label}</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground ml-0">Total:</span>
            <span className="font-medium font-mono text-foreground">
              {formatCurrency(payload[0].value, userBaseCurrency)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Spending Insights</h2>
        <p className="text-muted-foreground">
          Deep dive into your spending habits and merchant data.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Spender</CardTitle>
            <TrendingUp className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate" title={topSpender?.name || "-"}>
              {topSpender?.name || "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              {topSpender ? `Total ${formatCurrency(topSpender.total, userBaseCurrency)}` : "No data yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distinct Places</CardTitle>
            <Store className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMerchants}</div>
            <p className="text-xs text-muted-foreground">
              Unique merchants visited
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <CreditCard className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(avgTransaction, userBaseCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average spend per visit
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Merchants Chart */}
        <Card className="col-span-1 border-none shadow-md bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle>Top Merchants by Spend</CardTitle>
            <CardDescription>Visualizing your biggest spending destinations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              {topMerchants.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topMerchants.slice(0, 5)}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
                    barGap={2}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fontSize: 13, fill: axisColor }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                    <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={28} animationDuration={1000}>
                      {topMerchants.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No merchant data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Most Frequent Places */}
        <Card className="col-span-1 flex flex-col border-none shadow-md">
          <CardHeader>
            <CardTitle>Frequent Places</CardTitle>
            <CardDescription>Where you shop the most often</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[350px] px-6 pb-4">
              {topMerchantsCount.length > 0 ? (
                <div className="space-y-5">
                  {topMerchantsCount.map((merchant, index) => {
                    // Calculate width for progress bar feel
                    const maxCount = topMerchantsCount[0].count;
                    const widthPercent = (merchant.count / maxCount) * 100;

                    return (
                      <div key={merchant.name} className="group relative">
                        {/* Background Progress Bar */}
                        <div
                          className="absolute inset-0 bg-muted/30 rounded-lg transition-all duration-500"
                          style={{ width: `${widthPercent}%`, zIndex: 0 }}
                        />

                        <div className="relative z-10 flex items-center justify-between p-2 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex items-center justify-center h-9 w-9 rounded-full text-xs font-bold text-white shadow-sm ring-2 ring-background"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            >
                              {getInitials(merchant.name)}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-foreground">{merchant.name}</p>
                              <p className="text-xs text-muted-foreground">{merchant.count} visits</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">{formatCurrency(merchant.total, userBaseCurrency)}</p>
                            <p className="text-xs text-muted-foreground">Avg: {formatCurrency(merchant.avgSpend, userBaseCurrency)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No merchant data available
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Merchant List */}
      <Card className="border-none shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Merchant Breakdown</CardTitle>
            <CardDescription>Comprehensive list of all merchants sorted by spend</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-normal bg-muted/50">
            {totalMerchants} Merchants
          </Badge>
        </CardHeader>
        <CardContent>
          {topMerchants.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-muted-foreground mb-4 px-4 uppercase tracking-wider">
                <div className="col-span-5">Merchant</div>
                <div className="col-span-3 text-right">Visits</div>
                <div className="col-span-4 text-right">Total Spend</div>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="space-y-1">
                  {topMerchants.map((merchant, i) => (
                    <div
                      key={merchant.name}
                      className="grid grid-cols-12 gap-4 py-3 px-4 hover:bg-muted/60 hover:scale-[1.01] transition-all duration-200 rounded-lg items-center text-sm group cursor-default"
                    >
                      <div className="col-span-5 font-medium flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-muted-foreground bg-muted group-hover:bg-background group-hover:text-foreground transition-colors border border-border"
                        >
                          {getInitials(merchant.name)}
                        </div>
                        <span className="truncate">{merchant.name}</span>
                      </div>
                      <div className="col-span-3 text-right text-muted-foreground font-mono">
                        {merchant.count}
                      </div>
                      <div className="col-span-4 text-right font-medium font-mono text-foreground">
                        {formatCurrency(merchant.total, userBaseCurrency)}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/30" />
              <p>No merchant data available yet.</p>
              <p className="text-sm">Start adding merchants to your expenses to see insights here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
