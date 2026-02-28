"use client";

import { Filter } from "lucide-react";

/* ============================================
   FILTER BAR — ENTERPRISE + WCAG 2.2
   Accesibilidad:
   - role="toolbar" con aria-label
   - aria-pressed para estado activo
   - focus-visible ring
   ============================================ */

interface FilterBarProps {
  filters: string[];
  active: string;
  onFilter: (filter: string) => void;
  label?: string;
}

export function FilterBar({ filters, active, onFilter, label = "Filtros" }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-5" role="toolbar" aria-label={label}>
      <span className="text-[var(--color-text-muted)] text-xs flex items-center gap-1" aria-hidden="true">
        <Filter size={12} /> Filtros:
      </span>
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onFilter(f)}
          aria-pressed={active === f}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)] focus-visible:ring-offset-2
            ${
              active === f
                ? "bg-[var(--color-brand-500)] text-white"
                : "text-[var(--color-text-secondary)] border border-[var(--color-dashboard-border)] hover:border-[var(--color-brand-500)]/50"
            }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
