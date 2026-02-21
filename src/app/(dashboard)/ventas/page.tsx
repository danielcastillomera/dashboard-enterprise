"use client";

import { useState } from "react";
import { Plus, Download, FileText, FileSpreadsheet, Calendar } from "lucide-react";
import { PageHeader, Card, CardHeader, Button, FilterBar, DataTable, type Column } from "@/components/ui";
import { getActiveTenantConfig, formatCurrency, formatDate } from "@/lib/tenant-config";
import { mockSales } from "@/lib/mock-data";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";
import type { Sale } from "@/types";

export default function VentasPage() {
  const config = getActiveTenantConfig();
  const [filter, setFilter] = useState("Todas");
  const [showForm, setShowForm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [formData, setFormData] = useState({ productName: "", quantity: "", unitPrice: "" });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredSales = (filter === "Todas"
    ? mockSales
    : filter === "Hoy"
      ? mockSales.filter((s) => s.date.toDateString() === new Date().toDateString())
      : filter === "Esta Semana"
        ? mockSales.filter((s) => {
            const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
            return s.date >= weekAgo;
          })
        : [...mockSales].sort((a, b) => b.quantity - a.quantity)
  ).filter((s) => {
    if (dateFrom && s.date < new Date(dateFrom)) return false;
    if (dateTo && s.date > new Date(dateTo + "T23:59:59")) return false;
    return true;
  });

  const totalUnits = filteredSales.reduce((s, v) => s + v.quantity, 0);
  const totalRevenue = filteredSales.reduce((s, v) => s + v.total, 0);

  // Columnas de exportación
  const exportColumns = [
    { key: "productName", header: "Producto" },
    { key: "quantity", header: "Cantidad" },
    { key: "unitPrice", header: "Precio Unitario" },
    { key: "total", header: "Total" },
    { key: "date", header: "Fecha" },
  ];

  function handleExportCSV() {
    exportToCSV(filteredSales as unknown as Record<string, unknown>[], exportColumns, `ventas_${new Date().toISOString().split("T")[0]}`);
    setShowExportMenu(false);
  }

  async function handleExportPDF() {
    await exportToPDF(filteredSales as unknown as Record<string, unknown>[], exportColumns, `Reporte de Ventas — ${config.name}`, `ventas_${new Date().toISOString().split("T")[0]}`);
    setShowExportMenu(false);
  }

  const columns: Column<Sale>[] = [
    {
      key: "product",
      header: "PRODUCTO",
      render: (s) => <span className="text-[var(--color-text-primary)] font-medium">{s.productName}</span>,
    },
    {
      key: "quantity",
      header: "CANTIDAD",
      render: (s) => <span className="text-[var(--color-text-secondary)]">{s.quantity}</span>,
    },
    {
      key: "unitPrice",
      header: "PRECIO UNIT.",
      render: (s) => <span className="text-[var(--color-text-secondary)]">{formatCurrency(s.unitPrice, config)}</span>,
    },
    {
      key: "total",
      header: "TOTAL",
      render: (s) => <span className="text-[var(--color-text-primary)] font-semibold">{formatCurrency(s.total, config)}</span>,
    },
    {
      key: "date",
      header: "FECHA",
      render: (s) => <span className="text-[var(--color-text-muted)] text-xs">{formatDate(s.date, config)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Módulo de Ventas"
        description="Registro y análisis de ventas"
        actions={
          <div className="flex gap-2">
            {/* Export dropdown */}
            <div className="relative">
              <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={() => setShowExportMenu(!showExportMenu)}>
                Exportar
              </Button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] shadow-lg py-1 z-50">
                  <button onClick={handleExportCSV} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)] transition-colors">
                    <FileSpreadsheet size={14} className="text-green-500" />
                    Exportar CSV
                  </button>
                  <button onClick={handleExportPDF} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)] transition-colors">
                    <FileText size={14} className="text-red-500" />
                    Exportar PDF
                  </button>
                </div>
              )}
            </div>
            <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowForm(!showForm)}>
              Registrar Venta
            </Button>
          </div>
        }
      />

      {showForm && (
        <Card className="mb-5">
          <CardHeader title="Nueva Venta" />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label htmlFor="sale-product" className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Producto</label>
              <input id="sale-product" placeholder="Nombre del producto" value={formData.productName} onChange={(e) => setFormData({...formData, productName: e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-500)]" />
            </div>
            <div>
              <label htmlFor="sale-qty" className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Cantidad</label>
              <input id="sale-qty" placeholder="0" type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-500)]" />
            </div>
            <div>
              <label htmlFor="sale-price" className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Precio Venta ($)</label>
              <input id="sale-price" placeholder="0.00" type="number" step="0.01" value={formData.unitPrice} onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-500)]" />
            </div>
            <div className="flex items-end">
              <Button size="md" className="w-full">Registrar Venta</Button>
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

      <FilterBar filters={["Todas", "Hoy", "Esta Semana", "Más Vendidos"]} active={filter} onFilter={setFilter} />
      <DataTable columns={columns} data={filteredSales} emptyMessage="No hay ventas registradas" caption="Tabla de ventas" />

      <div className="mt-4 flex justify-end">
        <div className="rounded-xl bg-[var(--color-brand-500)] text-white px-6 py-3 flex gap-6 text-sm font-semibold">
          <span>TOTAL VENTAS</span>
          <span>{totalUnits} uds.</span>
          <span>{formatCurrency(totalRevenue, config)}</span>
        </div>
      </div>
    </div>
  );
}
