"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, PieLabelRenderProps } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { convertToBaseCurrency } from "@/lib/currency-conversion";

interface CategoryBreakdownChartProps {
  expenses: {
    id: string;
    amount: number;
    currency: string;
    exchangeRate: number;
    category: { id: string; name: string; color: string } | null;
  }[];
  userBaseCurrency: string;
}

export function CategoryBreakdownChart({ expenses, userBaseCurrency }: CategoryBreakdownChartProps) {
  // Group expenses by category (converted to base currency)
  const getCategoryData = () => {
    const categoryTotals: { [key: string]: { name: string; amount: number; color: string } } = {};

    expenses.forEach((expense) => {
      const categoryName = expense.category?.name || "Uncategorized";
      const categoryColor = expense.category?.color || "#6b7280";

      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = {
          name: categoryName,
          amount: 0,
          color: categoryColor,
        };
      }
      const convertedAmount = convertToBaseCurrency(expense, userBaseCurrency);
      categoryTotals[categoryName].amount += convertedAmount;
    });

    return Object.values(categoryTotals)
      .map((cat) => ({
        ...cat,
        amount: Math.round(cat.amount * 100) / 100,
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const data = getCategoryData();
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  const renderCustomizedLabel = (props: PieLabelRenderProps) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    if (
      percent === undefined ||
      percent < 0.05 ||
      typeof cx !== "number" ||
      typeof cy !== "number" ||
      typeof midAngle !== "number" ||
      typeof innerRadius !== "number" ||
      typeof outerRadius !== "number"
    ) {
      return null;
    }
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Category Breakdown</CardTitle>
          <p className="text-sm text-muted-foreground">
            Spending distribution by category
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No expense data yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Category Breakdown</CardTitle>
        <p className="text-sm text-muted-foreground">
          Spending distribution by category this month
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number | undefined) => [
                  `${formatCurrency(value ?? 0, userBaseCurrency)} (${(((value ?? 0) / total) * 100).toFixed(1)}%)`,
                  "Amount",
                ]}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                }}
                formatter={(value) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
