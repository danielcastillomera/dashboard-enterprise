"use client";

import { useState } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { PageHeader, Card, CardHeader, Button, FilterBar } from "@/components/ui";
import { SalesTrendChart, CategoryChart, TopProductsChart } from "@/components/charts";
import { getActiveTenantConfig, formatCurrency } from "@/lib/tenant-config";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";
import {
  getMonthlySalesData,
  getCategorySalesData,
  getTopProducts,
  getFinancialSummary,
  mockSales,
  mockPurchases,
} from "@/lib/mock-data";

type ReportView = "General" | "Ventas" | "Compras" | "Rentabilidad";

export default function ReportesPage() {
  const config = getActiveTenantConfig();
  const [view, setView] = useState<ReportView>("General");
  const [showExportMenu, setShowExportMenu] = useState(false);

  const monthlySales = getMonthlySalesData();
  const categorySales = getCategorySalesData();
  const topProducts = getTopProducts(5);
  const financial = getFinancialSummary();

  const totalSalesQty = mockSales.reduce((s, v) => s + v.quantity, 0);
  const totalPurchaseQty = mockPurchases.reduce((s, p) => s + p.quantity, 0);
  const totalPurchaseCost = mockPurchases.reduce((s, p) => s + p.total, 0);
  const marginPct = financial.revenue > 0 ? Math.round((financial.profit / financial.revenue) * 100) : 0;

  const reportExportColumns = [
    { key: "label", header: "Concepto" },
    { key: "value", header: "Valor" },
  ];
  const reportData = [
    { label: "Ingresos Totales", value: formatCurrency(financial.revenue, config) },
    { label: "Costos Totales", value: formatCurrency(financial.cost, config) },
    { label: "Ganancia Neta", value: formatCurrency(financial.profit, config) },
    { label: "Margen", value: `${marginPct}%` },
    { label: "Transacciones de venta", value: String(mockSales.length) },
    { label: "Unidades vendidas", value: String(totalSalesQty) },
    { label: "Compras realizadas", value: String(mockPurchases.length) },
    { label: "Unidades compradas", value: String(totalPurchaseQty) },
  ];

  function handleExportCSV() {
    exportToCSV(reportData as unknown as Record<string, unknown>[], reportExportColumns, `reporte-general_${new Date().toISOString().split("T")[0]}`);
    setShowExportMenu(false);
  }
  async function handleExportPDF() {
    await exportToPDF(reportData as unknown as Record<string, unknown>[], reportExportColumns, `Reporte General — ${config.name}`, `reporte-general_${new Date().toISOString().split("T")[0]}`);
    setShowExportMenu(false);
  }

  return (
    <div>
      <PageHeader
        title="Reportes"
        description="Análisis visual y exportación de datos"
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
          </div>
        }
      />

      <FilterBar filters={["General", "Ventas", "Compras", "Rentabilidad"]} active={view} onFilter={(v) => setView(v as ReportView)} />

      {/* Métricas rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Ingresos Totales", value: formatCurrency(financial.revenue, config), color: "var(--color-status-success)" },
          { label: "Costos Totales", value: formatCurrency(financial.cost, config), color: "var(--color-status-error)" },
          { label: "Ganancia Neta", value: formatCurrency(financial.profit, config), color: "var(--color-brand-500)" },
          { label: "Margen", value: `${marginPct}%`, color: marginPct > 40 ? "var(--color-status-success)" : "var(--color-status-warning)" },
        ].map((m) => (
          <div key={m.label} className="rounded-[var(--radius-card)] p-4 bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)]">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">{m.label}</p>
            <p className="text-xl font-bold" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Vista General */}
      {view === "General" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader title="Tendencia de Ventas vs Costos" />
            <SalesTrendChart data={monthlySales} />
          </Card>
          <Card>
            <CardHeader title="Ventas por Categoría" />
            <CategoryChart data={categorySales} />
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader title="Top 5 Productos Más Vendidos" />
            <TopProductsChart data={topProducts} />
          </Card>
        </div>
      )}

      {/* Vista Ventas */}
      {view === "Ventas" && (
        <div className="space-y-4">
          <Card>
            <CardHeader title="Evolución Mensual de Ventas" />
            <SalesTrendChart data={monthlySales} />
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader title="Distribución por Categoría" />
              <CategoryChart data={categorySales} />
            </Card>
            <Card>
              <CardHeader title="Resumen de Ventas" />
              <div className="space-y-3">
                {[
                  { label: "Total de ventas", value: `${mockSales.length} transacciones` },
                  { label: "Unidades vendidas", value: `${totalSalesQty} uds.` },
                  { label: "Ingreso total", value: formatCurrency(financial.revenue, config) },
                  { label: "Ticket promedio", value: formatCurrency(Math.round(financial.revenue / mockSales.length), config) },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-2 border-b border-[var(--color-dashboard-border)] last:border-b-0">
                    <span className="text-sm text-[var(--color-text-secondary)]">{row.label}</span>
                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">{row.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Vista Compras */}
      {view === "Compras" && (
        <Card>
          <CardHeader title="Resumen de Compras" />
          <div className="space-y-3">
            {[
              { label: "Total de compras", value: `${mockPurchases.length} registros` },
              { label: "Unidades compradas", value: `${totalPurchaseQty} uds.` },
              { label: "Inversión total", value: formatCurrency(totalPurchaseCost, config) },
              { label: "Costo promedio por compra", value: formatCurrency(Math.round(totalPurchaseCost / mockPurchases.length), config) },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center py-3 border-b border-[var(--color-dashboard-border)] last:border-b-0">
                <span className="text-sm text-[var(--color-text-secondary)]">{row.label}</span>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">{row.value}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Vista Rentabilidad */}
      {view === "Rentabilidad" && (
        <div className="space-y-4">
          <Card>
            <CardHeader title="Análisis de Rentabilidad" />
            <div className="space-y-4">
              {[
                { label: "Ingresos brutos", value: financial.revenue, color: "var(--color-status-success)" },
                { label: "Costos operativos", value: financial.cost, color: "var(--color-status-error)" },
                { label: "Ganancia neta", value: financial.profit, color: "var(--color-brand-500)" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--color-text-secondary)]">{row.label}</span>
                    <span className="font-bold" style={{ color: row.color }}>{formatCurrency(row.value, config)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-dashboard-border)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min((row.value / financial.revenue) * 100, 100)}%`,
                        backgroundColor: row.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader title="Margen por Categoría" />
            <CategoryChart data={categorySales} />
          </Card>
        </div>
      )}
    </div>
  );
}
