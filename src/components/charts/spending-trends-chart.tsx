"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SpendingTrendsChartProps {
  expenses: {
    id: string;
    amount: number;
    date: Date | string;
  }[];
}

export function SpendingTrendsChart({ expenses }: SpendingTrendsChartProps) {
  // Group expenses by month for the last 6 months
  const getMonthlyData = () => {
    const monthlyData: { [key: string]: number } = {};
    const now = new Date();

    // Initialize last 6 months with 0
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      monthlyData[monthKey] = 0;
    }

    // Sum expenses by month
    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      const monthKey = expenseDate.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      if (monthKey in monthlyData) {
        monthlyData[monthKey] += expense.amount;
      }
    });

    return Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount: Math.round(amount * 100) / 100,
    }));
  };

  const data = getMonthlyData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Spending Trends</CardTitle>
        <p className="text-sm text-muted-foreground">
          Your spending over the last 6 months
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#6366f1"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="#6366f1"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={({ x, y, payload }) => (
                  <text
                    x={x}
                    y={y + 12}
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-muted-foreground text-xs"
                    fontSize={12}
                  >
                    {payload.value}
                  </text>
                )}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={({ x, y, payload }) => (
                  <text
                    x={x - 4}
                    y={y + 4}
                    textAnchor="end"
                    fill="currentColor"
                    className="text-muted-foreground text-xs"
                    fontSize={12}
                  >
                    {formatCurrency(payload.value)}
                  </text>
                )}
                tickFormatter={formatCurrency}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number | undefined) => [formatCurrency(value ?? 0), "Spent"]}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAmount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
