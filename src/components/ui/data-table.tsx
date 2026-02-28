"use client";

import { useState, useMemo, type ReactNode } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  sortable?: boolean;
  sortValue?: (item: T) => string | number | Date;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  caption?: string;
  isLoading?: boolean;
  showIndex?: boolean;
}

type SortDir = "asc" | "desc" | null;

export function DataTable<T extends { id: string }>({
  columns,
  data,
  emptyMessage = "No hay datos para mostrar",
  caption,
  isLoading = false,
  showIndex = true,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return data;

    return [...data].sort((a, b) => {
      let va: string | number | Date;
      let vb: string | number | Date;

      if (col.sortValue) {
        va = col.sortValue(a);
        vb = col.sortValue(b);
      } else {
        // Try to extract text from render
        const ra = col.render(a);
        const rb = col.render(b);
        va = typeof ra === "string" || typeof ra === "number" ? ra : String(ra);
        vb = typeof rb === "string" || typeof rb === "number" ? rb : String(rb);
      }

      if (va instanceof Date && vb instanceof Date) {
        return sortDir === "asc" ? va.getTime() - vb.getTime() : vb.getTime() - va.getTime();
      }
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      return sortDir === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa);
    });
  }, [data, sortKey, sortDir, columns]);

  function toggleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
      setSortDir(null);
    }
  }

  if (!isLoading && data.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] p-12 text-center" role="status">
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
              {showIndex && (
                <th scope="col" className="px-3 py-3 text-center text-xs font-semibold text-[var(--color-text-muted)] w-10">#</th>
              )}
              {columns.map((col, colIdx) => {
                const isSortable = col.sortable !== false;
                const isActive = sortKey === col.key;
                return (
                  <th key={`th-${colIdx}`} scope="col"
                    className={`px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] whitespace-nowrap ${isSortable ? "cursor-pointer select-none hover:text-[var(--color-text-primary)] transition-colors" : ""}`}
                    onClick={isSortable ? () => toggleSort(col.key) : undefined}
                    aria-sort={isActive ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {isSortable && (
                        <span className={`transition-colors ${isActive ? "text-[var(--color-brand-500)]" : "text-[var(--color-text-muted)]/40"}`}>
                          {isActive && sortDir === "asc" ? <ArrowUp size={12} /> :
                           isActive && sortDir === "desc" ? <ArrowDown size={12} /> :
                           <ArrowUpDown size={12} />}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIdx) => (
                <tr key={`skel-${rowIdx}`} className="border-b border-[var(--color-dashboard-border)] last:border-b-0">
                  {showIndex && <td className="px-3 py-3"><div className="h-4 w-6 rounded bg-[var(--color-dashboard-border)] animate-pulse mx-auto" /></td>}
                  {columns.map((_, colIdx) => (
                    <td key={`skel-${rowIdx}-${colIdx}`} className="px-4 py-3">
                      <div className="h-4 rounded bg-[var(--color-dashboard-border)] animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              sorted.map((item, rowIdx) => (
                <tr key={`row-${rowIdx}-${item.id}`}
                  className="border-b border-[var(--color-dashboard-border)] last:border-b-0 hover:bg-[var(--color-dashboard-surface-hover)] transition-colors">
                  {showIndex && (
                    <td className="px-3 py-3 text-center text-xs font-medium text-[var(--color-text-muted)]">{rowIdx + 1}</td>
                  )}
                  {columns.map((col, colIdx) => (
                    <td key={`td-${rowIdx}-${colIdx}`} className="px-4 py-3 whitespace-nowrap">{col.render(item)}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
