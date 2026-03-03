"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CategoryChartProps {
  data: { name: string; value: number; color: string }[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
          label={({ name, value }) =>
            `${Math.round((value / total) * 100)}%`
          }
          labelLine={false}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--color-dashboard-surface)",
            border: "1px solid var(--color-dashboard-border)",
            borderRadius: 8,
            color: "var(--color-text-primary)",
            fontSize: 13,
          }}
          formatter={(value) => [
            `Q ${Number(value).toLocaleString()}`,
            "Ventas",
          ]}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: "var(--color-text-secondary)", fontSize: 11 }}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
