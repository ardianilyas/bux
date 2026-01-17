"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/features/auth/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import {
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell,
  Area, AreaChart, PieChart, Pie, Legend
} from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Store, TrendingUp, CreditCard, ShoppingBag, PieChart as PieChartIcon, Calendar as CalendarIcon, Wallet } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { subDays, format, startOfMonth, endOfMonth, differenceInDays } from "date-fns";

export function InsightsView() {
  const { data: session } = useSession();
  const userBaseCurrency = (session?.user as any)?.currency || "IDR";
  const { theme } = useTheme();

  // State for date range
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Dynamic color for charts based on theme
  const [axisColor, setAxisColor] = useState("#888888");
  useEffect(() => {
    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setAxisColor(isDark ? "#ffffff" : "#0f172a");
  }, [theme]);

  // Determine grouping based on date range
  const daysDiff = dateRange?.from && dateRange?.to ? differenceInDays(dateRange.to, dateRange.from) : 30;
  const groupType = daysDiff > 90 ? 'monthly' : 'daily';

  // Fetch Data
  const { data: trendData, isLoading: isTrendLoading } = trpc.expense.getTrends.useQuery(
    {
      startDate: dateRange?.from,
      endDate: dateRange?.to,
      type: groupType
    },
    { enabled: !!dateRange?.from }
  );

  const { data: categoryData, isLoading: isCategoryLoading } = trpc.expense.getBreakdown.useQuery(
    { startDate: dateRange?.from, endDate: dateRange?.to },
    { enabled: !!dateRange?.from }
  );

  const { data: merchantStats, isLoading: isMerchantLoading } = trpc.expense.getMerchantStats.useQuery(
    { startDate: dateRange?.from, endDate: dateRange?.to },
    { enabled: !!dateRange?.from }
  );

  const isLoading = isTrendLoading || isCategoryLoading || isMerchantLoading;

  // Colors
  const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#64748b"];

  // Helper Calculations
  const totalSpend = useMemo(() => {
    return trendData?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  }, [trendData]);

  const avgDailySpend = useMemo(() => {
    if (!trendData || trendData.length === 0) return 0;
    // If grouped by month, this logic needs adjustment or just show avg per period
    if (groupType === 'monthly') {
      return totalSpend / trendData.length; // Avg per month
    }
    return totalSpend / trendData.length; // Avg per day (since trendData is filled for days)
  }, [trendData, totalSpend, groupType]);

  const topCategory = useMemo(() => {
    return categoryData?.[0];
  }, [categoryData]);

  const topMerchants = merchantStats?.bySpend || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover/90 backdrop-blur-sm border border-border p-3 rounded-lg shadow-xl text-sm z-50">
          <p className="font-semibold text-foreground mb-1">{label}</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-medium font-mono text-foreground">
              {formatCurrency(payload[0].value, userBaseCurrency)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Spending Insights</h2>
          <p className="text-muted-foreground">
            Analyze where your money goes.
          </p>
        </div>
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tracking-tight">
              {formatCurrency(totalSpend, userBaseCurrency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              in selected period
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {groupType === 'monthly' ? "Avg. Monthly Spend" : "Avg. Daily Spend"}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tracking-tight">
              {formatCurrency(avgDailySpend, userBaseCurrency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              based on {trendData?.length || 0} {groupType === 'monthly' ? 'months' : 'days'}
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <PieChartIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate" title={topCategory?.name}>
              {topCategory?.name || "No data"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {topCategory ? formatCurrency(topCategory.amount, userBaseCurrency) : "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Trend Chart */}
      <Card className="col-span-1 shadow-md border-none">
        <CardHeader>
          <CardTitle>Spending Trend</CardTitle>
          <CardDescription>
            Expenses over time ({dateRange?.from ? format(dateRange.from, "MMM d, yyyy") : "Start"} - {dateRange?.to ? format(dateRange.to, "MMM d, yyyy") : "End"})
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-0">
          <div className="h-[300px] w-full">
            {trendData && trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey={groupType === 'monthly' ? "label" : "label"}
                    // For daily, maybe show less ticks?
                    tick={{ fontSize: 12, fill: axisColor }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={30}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: axisColor }}
                    tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(value)}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#6366f1", strokeWidth: 1, strokeDasharray: '5 5' }} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <TrendingUp className="h-10 w-10 mb-2 opacity-20" />
                <p>No spending data needed for trend</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Breakdown */}
        <Card className="col-span-1 shadow-md border-none flex flex-col">
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Spending distribution by category</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px] flex items-center justify-center">
            {categoryData && categoryData.length > 0 ? (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="amount"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color || COLORS[index % COLORS.length]}
                          strokeWidth={0}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{ fontSize: '12px' }}
                      formatter={(value, entry: any) => {
                        const item = categoryData.find(c => c.name === value);
                        return (
                          <span className="text-foreground ml-1">
                            {value}
                          </span>
                        )
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <PieChartIcon className="h-10 w-10 mb-2 opacity-20" />
                <p>No category data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Merchants List (Refined) */}
        <Card className="col-span-1 shadow-md border-none flex flex-col">
          <CardHeader>
            <CardTitle>Top Merchants</CardTitle>
            <CardDescription>Where you spent the most</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <ScrollArea className="h-[300px]">
              {topMerchants.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {topMerchants.slice(0, 6).map((merchant, i) => (
                    <div key={merchant.name} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white shadow-sm"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        >
                          {getInitials(merchant.name)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{merchant.name}</span>
                          <span className="text-[10px] text-muted-foreground">{merchant.count} transactions</span>
                        </div>
                      </div>
                      <div className="font-mono font-medium text-sm">
                        {formatCurrency(merchant.total, userBaseCurrency)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                  <Store className="h-10 w-10 mb-2 opacity-20" />
                  <p>No merchant data</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-[300px]" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full" />)}
      </div>
      <Skeleton className="h-[350px] w-full" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-[350px] w-full" />
        <Skeleton className="h-[350px] w-full" />
      </div>
    </div>
  )
}
