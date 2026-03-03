"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface SalesTrendChartProps {
  data: { mes: string; ventas: number; costos: number; margen: number }[];
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-dashboard-border)" />
        <XAxis
          dataKey="mes"
          stroke="var(--color-text-muted)"
          fontSize={12}
          tickLine={false}
        />
        <YAxis
          stroke="var(--color-text-muted)"
          fontSize={12}
          tickLine={false}
          tickFormatter={(v) => `Q${v}`}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-dashboard-surface)",
            border: "1px solid var(--color-dashboard-border)",
            borderRadius: 8,
            color: "var(--color-text-primary)",
            fontSize: 13,
          }}
          formatter={(value, dataKey) => [
            `Q ${Number(value).toLocaleString()}`,
            dataKey,
          ]}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>
              {value}
            </span>
          )}
        />
        <Area
          type="monotone"
          dataKey="ventas"
          name="Ventas"
          stroke="var(--color-chart-1)"
          fill="var(--color-chart-1)"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="costos"
          name="Costos"
          stroke="var(--color-status-error)"
          fill="var(--color-status-error)"
          fillOpacity={0.08}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
