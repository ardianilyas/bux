"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, PieLabelRenderProps } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface CategoryBreakdownChartProps {
  expenses: {
    id: string;
    amount: number;
    category: { id: string; name: string; color: string } | null;
  }[];
}

export function CategoryBreakdownChart({ expenses }: CategoryBreakdownChartProps) {
  // Group expenses by category
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
      categoryTotals[categoryName].amount += expense.amount;
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
          This month's spending by category
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
                innerRadius={40}
                fill="#8884d8"
                dataKey="amount"
                paddingAngle={2}
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
                itemStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number | undefined, name?: string) => [
                  `${formatCurrency(value ?? 0)} (${(((value ?? 0) / total) * 100).toFixed(1)}%)`,
                  name ?? "",
                ]}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value: string) => (
                  <span className="text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
