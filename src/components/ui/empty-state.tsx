import { Construction } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  phase: string;
}

export function EmptyState({ title, description, phase }: EmptyStateProps) {
  return (
    <div className="rounded-[var(--radius-card)] p-12 bg-[var(--color-dashboard-surface)] border-2 border-dashed border-[var(--color-dashboard-border)] text-center">
      <Construction
        size={40}
        className="mx-auto mb-4 text-[var(--color-brand-500)]"
      />
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-secondary)] mb-1">
        {description}
      </p>
      <p className="text-xs text-[var(--color-text-muted)]">{phase}</p>
    </div>
  );
}
