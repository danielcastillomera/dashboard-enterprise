"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, XCircle, Download, FileText, FileSpreadsheet } from "lucide-react";
import { PageHeader, Card, Badge, FilterBar, Button } from "@/components/ui";
import { getActiveTenantConfig } from "@/lib/tenant-config";
import { mockProducts } from "@/lib/mock-data";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";

export default function InventarioPage() {
  const config = getActiveTenantConfig();
  const [filter, setFilter] = useState("Todos");
  const [showExportMenu, setShowExportMenu] = useState(false);

  const getStatus = (p: typeof mockProducts[0]) => {
    if (p.stock === 0) return "agotado";
    if (p.stock <= p.minStock) return "bajo";
    return "ok";
  };

  const filtered = filter === "Todos"
    ? mockProducts
    : filter === "OK"
      ? mockProducts.filter((p) => getStatus(p) === "ok")
      : filter === "Bajo Stock"
        ? mockProducts.filter((p) => getStatus(p) === "bajo")
        : mockProducts.filter((p) => getStatus(p) === "agotado");

  const totalStock = mockProducts.reduce((s, p) => s + p.stock, 0);
  const lowCount = mockProducts.filter((p) => getStatus(p) === "bajo").length;
  const outCount = mockProducts.filter((p) => getStatus(p) === "agotado").length;

  return (
    <div>
      <PageHeader
        title="Inventario"
        description="Control de stock en tiempo real"
        actions={
          <div className="relative">
            <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={() => setShowExportMenu(!showExportMenu)}>Exportar</Button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] shadow-lg py-1 z-50">
                <button onClick={() => { exportToCSV(filtered.map(p => ({ nombre: p.name, stock: p.stock, minStock: p.minStock, estado: getStatus(p) })) as unknown as Record<string, unknown>[], [{ key: "nombre", header: "Producto" }, { key: "stock", header: "Stock" }, { key: "minStock", header: "Stock Mín." }, { key: "estado", header: "Estado" }], `inventario_${new Date().toISOString().split("T")[0]}`); setShowExportMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)] transition-colors">
                  <FileSpreadsheet size={14} className="text-green-500" /> Exportar CSV
                </button>
                <button onClick={async () => { await exportToPDF(filtered.map(p => ({ nombre: p.name, stock: p.stock, minStock: p.minStock, estado: getStatus(p) })) as unknown as Record<string, unknown>[], [{ key: "nombre", header: "Producto" }, { key: "stock", header: "Stock" }, { key: "minStock", header: "Stock Mín." }, { key: "estado", header: "Estado" }], `Inventario — ${config.name}`, `inventario_${new Date().toISOString().split("T")[0]}`); setShowExportMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)] transition-colors">
                  <FileText size={14} className="text-red-500" /> Exportar PDF
                </button>
              </div>
            )}
          </div>
        }
      />

      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Stock Total", value: totalStock, icon: <CheckCircle size={16} />, color: "var(--color-status-success)" },
          { label: "Bajo Stock", value: lowCount, icon: <AlertTriangle size={16} />, color: "var(--color-status-warning)" },
          { label: "Agotados", value: outCount, icon: <XCircle size={16} />, color: "var(--color-status-error)" },
        ].map((s) => (
          <div key={s.label} className="rounded-[var(--radius-card)] p-4 bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${s.color}20`, color: s.color }}>{s.icon}</div>
            <div>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{s.value}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <FilterBar filters={["Todos", "OK", "Bajo Stock", "Agotado"]} active={filter} onFilter={setFilter} />

      {/* Grid de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((product) => {
          const status = getStatus(product);
          const pct = Math.min((product.stock / (product.minStock * 3)) * 100, 100);
          const barColor = status === "ok" ? "var(--color-status-success)" : status === "bajo" ? "var(--color-status-warning)" : "var(--color-status-error)";

          return (
            <Card key={product.id}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{product.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{product.brand} {product.color && `· ${product.color}`}</p>
                </div>
                <Badge variant={status === "ok" ? "success" : status === "bajo" ? "warning" : "error"}>
                  {status === "ok" ? "EN STOCK" : status === "bajo" ? "BAJO" : "AGOTADO"}
                </Badge>
              </div>
              <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-2">
                <span>Stock actual: <strong className="text-[var(--color-text-primary)]">{product.stock}</strong></span>
                <span>Mínimo: {product.minStock}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--color-dashboard-border)] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: barColor }} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
