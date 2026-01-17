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
import { formatCurrency } from "@/lib/utils";
import { convertToBaseCurrency } from "@/lib/currency-conversion";

interface SpendingTrendsChartProps {
  data: {
    month: string;
    amount: number;
  }[];
  userBaseCurrency: string;
}

export function SpendingTrendsChart({ data, userBaseCurrency }: SpendingTrendsChartProps) {

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-foreground">Spending Trends</CardTitle>
        <p className="text-sm text-muted-foreground">
          Your spending over the last 6 months
        </p>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-full w-full min-h-[300px]">
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
                    {formatCurrency(payload.value, userBaseCurrency)}
                  </text>
                )}
                tickFormatter={(value) => formatCurrency(value, userBaseCurrency)}
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
                formatter={(value: number | undefined) => [formatCurrency(value ?? 0, userBaseCurrency), "Spent"]}
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
