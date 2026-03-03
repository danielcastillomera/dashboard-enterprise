import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className = "", padding = true }: CardProps) {
  return (
    <div
      className={`
        rounded-[var(--radius-card)]
        bg-[var(--color-dashboard-surface)]
        border border-[var(--color-dashboard-border)]
        shadow-[var(--shadow-card)]
        ${padding ? "p-5" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  actions?: ReactNode;
  icon?: ReactNode;
}

export function CardHeader({ title, actions, icon }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {icon && <span className="text-[var(--color-text-muted)]">{icon}</span>}
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
          {title}
        </h3>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
