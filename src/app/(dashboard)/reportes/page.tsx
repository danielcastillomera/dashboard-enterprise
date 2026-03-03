"use client";

import { useState } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { PageHeader, Card, CardHeader, Button, FilterBar, ErrorState, ChartSkeleton } from "@/components/ui";
import { SalesTrendChart, CategoryChart, TopProductsChart } from "@/components/charts";
import { getActiveTenantConfig, formatCurrency } from "@/lib/tenant-config";
import { useExport } from "@/lib/use-export";
import { useData } from "@/lib/hooks/use-data";

type ReportView = "General" | "Ventas" | "Compras" | "Rentabilidad";

interface DashboardData {
  financial: { revenue: number; cost: number; profit: number };
  monthlySales: { mes: string; ventas: number; costos: number; margen: number }[];
  categorySales: { name: string; value: number; color: string }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
}

export default function ReportesPage() {
  const config = getActiveTenantConfig();
  const { handleExportCSV: exportCSV, handleExportPDF: exportPDF } = useExport();
  const [view, setView] = useState<ReportView>("General");
  const [showExportMenu, setShowExportMenu] = useState(false);

  const { data, isLoading, error, mutate } = useData<DashboardData>("/api/dashboard");

  const financial = data?.financial || { revenue: 0, cost: 0, profit: 0 };
  const marginPct = financial.revenue > 0 ? Math.round((financial.profit / financial.revenue) * 100) : 0;

  const reportExportColumns = [{ key: "label", header: "Concepto" }, { key: "value", header: "Valor" }];
  const reportData = [
    { label: "Ingresos Totales", value: formatCurrency(financial.revenue, config) },
    { label: "Costos Totales", value: formatCurrency(financial.cost, config) },
    { label: "Ganancia Neta", value: formatCurrency(financial.profit, config) },
    { label: "Margen", value: `${marginPct}%` },
  ];

  function handleExportCSV() { exportCSV(reportData as unknown as Record<string, unknown>[], reportExportColumns, `reporte_${new Date().toISOString().split("T")[0]}`); setShowExportMenu(false); }
  async function handleExportPDF() { await exportPDF(reportData as unknown as Record<string, unknown>[], reportExportColumns, `Reporte General — ${config.name}`, `reporte_${new Date().toISOString().split("T")[0]}`); setShowExportMenu(false); }

  if (error) return <ErrorState message={error} onRetry={mutate} />;

  return (
    <div>
      <PageHeader title="Reportes" description="Análisis y métricas del negocio"
        actions={
          <div className="relative">
            <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={() => setShowExportMenu(!showExportMenu)}>Exportar</Button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] shadow-lg py-1 z-50">
                <button onClick={handleExportCSV} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)] transition-colors"><FileSpreadsheet size={14} className="text-green-500" /> CSV</button>
                <button onClick={handleExportPDF} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)] transition-colors"><FileText size={14} className="text-red-500" /> PDF</button>
              </div>
            )}
          </div>
        } />

      <div className="mb-6">
        <FilterBar filters={["General", "Ventas", "Compras", "Rentabilidad"]} active={view} onFilter={(v) => setView(v as ReportView)} label="Vistas de reporte" />
      </div>

      {/* KPI financieros */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Ingresos", value: formatCurrency(financial.revenue, config), color: "text-green-500" },
          { label: "Costos", value: formatCurrency(financial.cost, config), color: "text-red-500" },
          { label: "Ganancia", value: formatCurrency(financial.profit, config), color: "text-[var(--color-brand-500)]" },
          { label: "Margen", value: `${marginPct}%`, color: "text-blue-500" },
        ].map(kpi => (
          <Card key={kpi.label}>
            <p className="text-xs text-[var(--color-text-muted)] mb-1">{kpi.label}</p>
            {isLoading ? <div className="h-7 w-24 rounded bg-[var(--color-dashboard-border)] animate-pulse" />
              : <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>}
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card><CardHeader title="Tendencia de Ventas (6 meses)" />
          {isLoading ? <ChartSkeleton /> : data?.monthlySales && <SalesTrendChart data={data.monthlySales} />}
        </Card>
        <Card><CardHeader title="Ventas por Categoría" />
          {isLoading ? <ChartSkeleton /> : data?.categorySales && <CategoryChart data={data.categorySales} />}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardHeader title="Top Productos" />
          {isLoading ? <ChartSkeleton /> : data?.topProducts && <TopProductsChart data={data.topProducts} />}
        </Card>
        <Card>
          <CardHeader title="Resumen Financiero" />
          {isLoading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-6 rounded bg-[var(--color-dashboard-border)] animate-pulse" />)}</div>
          : (
            <div className="space-y-0">
              {[
                { label: "Ingresos", value: formatCurrency(financial.revenue, config), color: "var(--color-status-success)" },
                { label: "Costo", value: formatCurrency(financial.cost, config), color: "var(--color-status-error)" },
                { label: "Ganancia Real", value: formatCurrency(financial.profit, config), color: "var(--color-brand-500)" },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-3 border-b border-[var(--color-dashboard-border)] last:border-b-0">
                  <span className="text-sm text-[var(--color-text-secondary)]">{row.label}</span>
                  <span className="text-sm font-bold" style={{ color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
