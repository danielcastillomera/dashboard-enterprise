import { type ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
  color?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  color = "var(--color-brand-500)",
}: StatCardProps) {
  return (
    <div
      className="rounded-[var(--radius-card)] p-5
        bg-[var(--color-dashboard-surface)]
        border border-[var(--color-dashboard-border)]
        hover:border-[var(--color-brand-500)]/50
        transition-colors duration-200"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[var(--color-text-secondary)] text-xs font-medium">
            {label}
          </p>
          <p className="text-[var(--color-text-primary)] text-2xl font-bold mt-2">
            {value}
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: `${color}20`,
            color: color,
          }}
        >
          {icon}
        </div>
      </div>
      {trend !== undefined && (
        <p
          className="text-xs font-semibold mt-3"
          style={{
            color: trend >= 0
              ? "var(--color-status-success)"
              : "var(--color-status-error)",
          }}
        >
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% vs mes anterior
        </p>
      )}
    </div>
  );
}
