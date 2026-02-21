"use client";

import { useState } from "react";
import { Plus, Download, FileText, FileSpreadsheet, Calendar } from "lucide-react";
import { PageHeader, Card, CardHeader, Button, FilterBar, DataTable, type Column } from "@/components/ui";
import { getActiveTenantConfig, formatCurrency, formatDate } from "@/lib/tenant-config";
import { mockPurchases } from "@/lib/mock-data";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";
import type { Purchase } from "@/types";

export default function ComprasPage() {
  const config = getActiveTenantConfig();
  const [filter, setFilter] = useState("Todas");
  const [showForm, setShowForm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [formData, setFormData] = useState({ productName: "", quantity: "", unitCost: "", date: "" });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredPurchases = mockPurchases.filter((p) => {
    if (dateFrom && p.date < new Date(dateFrom)) return false;
    if (dateTo && p.date > new Date(dateTo + "T23:59:59")) return false;
    return true;
  });

  const totalUnits = filteredPurchases.reduce((s, p) => s + p.quantity, 0);
  const totalCost = filteredPurchases.reduce((s, p) => s + p.total, 0);

  const exportColumns = [
    { key: "productName", header: "Producto" },
    { key: "quantity", header: "Cantidad" },
    { key: "unitCost", header: "Precio Compra" },
    { key: "total", header: "Total" },
    { key: "date", header: "Fecha" },
  ];

  function handleExportCSV() {
    exportToCSV(filteredPurchases as unknown as Record<string, unknown>[], exportColumns, `compras_${new Date().toISOString().split("T")[0]}`);
    setShowExportMenu(false);
  }
  async function handleExportPDF() {
    await exportToPDF(filteredPurchases as unknown as Record<string, unknown>[], exportColumns, `Reporte de Compras — ${config.name}`, `compras_${new Date().toISOString().split("T")[0]}`);
    setShowExportMenu(false);
  }

  const columns: Column<Purchase>[] = [
    { key: "product", header: "PRODUCTO", render: (p) => <span className="text-[var(--color-text-primary)] font-medium">{p.productName}</span> },
    { key: "quantity", header: "CANTIDAD", render: (p) => <span className="text-[var(--color-text-secondary)]">{p.quantity}</span> },
    { key: "cost", header: "PRECIO COMPRA", render: (p) => <span className="text-[var(--color-text-secondary)]">{formatCurrency(p.unitCost, config)}</span> },
    { key: "total", header: "TOTAL", render: (p) => <span className="text-[var(--color-text-primary)] font-semibold">{formatCurrency(p.total, config)}</span> },
    { key: "date", header: "FECHA", render: (p) => <span className="text-[var(--color-text-muted)] text-xs">{formatDate(p.date, config)}</span> },
  ];

  const inputClass = "w-full px-3 py-2 rounded-lg text-sm bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-500)]";

  return (
    <div>
      <PageHeader
        title="Módulo de Compras"
        description="Registro de compras a proveedores"
        actions={
          <div className="flex gap-2">
            <div className="relative">
              <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={() => setShowExportMenu(!showExportMenu)}>Exportar</Button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] shadow-lg py-1 z-50">
                  <button onClick={handleExportCSV} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)] transition-colors">
                    <FileSpreadsheet size={14} className="text-green-500" /> Exportar CSV
                  </button>
                  <button onClick={handleExportPDF} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)] transition-colors">
                    <FileText size={14} className="text-red-500" /> Exportar PDF
                  </button>
                </div>
              )}
            </div>
            <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowForm(!showForm)}>Registrar Compra</Button>
          </div>
        }
      />

      {showForm && (
        <Card className="mb-5">
          <CardHeader title="Nueva Compra" />
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div>
              <label htmlFor="purchase-product" className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Producto</label>
              <input id="purchase-product" placeholder="Nombre" value={formData.productName} onChange={(e) => setFormData({...formData, productName: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label htmlFor="purchase-qty" className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Cantidad</label>
              <input id="purchase-qty" placeholder="0" type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label htmlFor="purchase-cost" className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Precio Compra ($)</label>
              <input id="purchase-cost" placeholder="0.00" type="number" step="0.01" value={formData.unitCost} onChange={(e) => setFormData({...formData, unitCost: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label htmlFor="purchase-date" className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Fecha</label>
              <input id="purchase-date" type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className={inputClass} />
            </div>
            <div className="flex items-end">
              <Button size="md" className="w-full">Registrar</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filtro por rango de fechas */}
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={14} className="text-[var(--color-text-muted)]" />
        <span className="text-xs text-[var(--color-text-muted)]">Rango:</span>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="Fecha desde"
          className="px-2 py-1.5 text-xs rounded-lg bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-500)]" />
        <span className="text-xs text-[var(--color-text-muted)]">—</span>
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="Fecha hasta"
          className="px-2 py-1.5 text-xs rounded-lg bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-500)]" />
        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-xs text-[var(--color-status-error)] hover:underline">Limpiar</button>
        )}
      </div>

      <FilterBar filters={["Todas", "Este Mes", "Último Trimestre"]} active={filter} onFilter={setFilter} />
      <DataTable columns={columns} data={filteredPurchases} emptyMessage="No hay compras registradas" caption="Tabla de compras" />

      <div className="mt-4 flex justify-end">
        <div className="rounded-xl bg-[var(--color-status-info)] text-white px-6 py-3 flex gap-6 text-sm font-semibold">
          <span>TOTALES</span>
          <span>{totalUnits} uds.</span>
          <span>{formatCurrency(totalCost, config)}</span>
        </div>
      </div>
    </div>
  );
}
