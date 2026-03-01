"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TopProductsChartProps {
  data: { name: string; quantity: number; revenue: number }[];
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart layout="vertical" data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-dashboard-border)" />
        <XAxis
          type="number"
          stroke="var(--color-text-muted)"
          fontSize={12}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          stroke="var(--color-text-muted)"
          fontSize={10}
          width={130}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-dashboard-surface)",
            border: "1px solid var(--color-dashboard-border)",
            borderRadius: 8,
            color: "var(--color-text-primary)",
            fontSize: 13,
          }}
          formatter={(value) => [
            `${value} unidades`,
            "Cantidad",
          ]}
        />
        <Bar
          dataKey="quantity"
          name="quantity"
          fill="var(--color-chart-4)"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
