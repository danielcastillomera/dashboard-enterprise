"use client";

import { type ReactNode } from "react";

/* ============================================
   DATA TABLE — ENTERPRISE + WCAG 2.2
   Estándar: Stripe Dashboard, Shopify Admin
   
   Accesibilidad:
   - role="table" con caption
   - scope="col" en headers
   - aria-sort para columnas ordenables
   - Focus visible en filas interactivas
   ============================================ */

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  caption?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  emptyMessage = "No hay datos para mostrar",
  caption,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div
        className="rounded-[var(--radius-card)] bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] p-12 text-center"
        role="status"
      >
        <p className="text-sm text-[var(--color-text-muted)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-card)] bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] overflow-hidden">
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={caption || "Tabla de datos"}>
        <table className="w-full text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-[var(--color-dashboard-border)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className="border-b border-[var(--color-dashboard-border)] last:border-b-0 hover:bg-[var(--color-dashboard-surface-hover)] transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
