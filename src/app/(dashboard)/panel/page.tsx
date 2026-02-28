"use client";

import { useState } from "react";
import {
  ShoppingCart, DollarSign, BarChart3, Boxes,
  TrendingUp, AlertTriangle, Package,
} from "lucide-react";
import { StatCard, Card, CardHeader, PageHeader, Badge, CardSkeleton, ChartSkeleton, ErrorState } from "@/components/ui";
import { SalesTrendChart, CategoryChart, TopProductsChart } from "@/components/charts";
import { getActiveTenantConfig, formatCurrency } from "@/lib/tenant-config";
import { useData } from "@/lib/hooks/use-data";
import type { DashboardKPI } from "@/types";

interface DashboardData {
  kpis: DashboardKPI[];
  financial: { revenue: number; cost: number; profit: number };
  monthlySales: { mes: string; ventas: number; costos: number; margen: number }[];
  categorySales: { name: string; value: number; color: string }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  recentOrders: { id: string; clientName: string; total: number; status: string }[];
  inventoryAlerts: { id: string; name: string; stock: number; minStock: number; status: string }[];
}

const iconMap: Record<string, React.ReactNode> = {
  Boxes: <Boxes size={20} />, DollarSign: <DollarSign size={20} />,
  TrendingUp: <TrendingUp size={20} />, ShoppingCart: <ShoppingCart size={20} />,
  BarChart3: <BarChart3 size={20} />, AlertTriangle: <AlertTriangle size={20} />,
  Package: <Package size={20} />,
};

type TimeFilter = "Hoy" | "Semana" | "Mes" | "Año";

export default function PanelPage() {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("Mes");
  const config = getActiveTenantConfig();
  const { data, isLoading, error, mutate } = useData<DashboardData>("/api/dashboard");

  const statusVariant: Record<string, "success" | "warning" | "error" | "info"> = {
    pendiente: "warning", pagado: "info", enviado: "info", entregado: "success", cancelado: "error",
  };

  if (error) return <ErrorState message={error} onRetry={mutate} />;

  return (
    <div>
      <PageHeader title="Panel de Control" description={`Resumen general de ${config.name}`} />

      {/* Filtros de tiempo */}
      <div className="flex gap-2 mb-6" role="group" aria-label="Filtro de período">
        {(["Hoy", "Semana", "Mes", "Año"] as TimeFilter[]).map((f) => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeFilter === f ? "bg-[var(--color-brand-500)] text-white"
                : "text-[var(--color-text-secondary)] border border-[var(--color-dashboard-border)] hover:border-[var(--color-brand-500)]/50"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : data?.kpis.map((kpi) => (
            <StatCard key={kpi.label} label={kpi.label} value={kpi.value}
              icon={iconMap[kpi.icon] || <Package size={20} />} trend={kpi.trend} color={kpi.color} />
          ))}
      </div>

      {/* Gráficos fila 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card><CardHeader title="Tendencia de Ventas (6 meses)" />
          {isLoading ? <ChartSkeleton /> : data && <SalesTrendChart data={data.monthlySales} />}
        </Card>
        <Card><CardHeader title="Ventas por Categoría" />
          {isLoading ? <ChartSkeleton /> : data && <CategoryChart data={data.categorySales} />}
        </Card>
      </div>

      {/* Gráficos fila 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card><CardHeader title="Top 5 Más Vendidos" />
          {isLoading ? <ChartSkeleton /> : data && <TopProductsChart data={data.topProducts} />}
        </Card>
        <Card><CardHeader title="Resumen Financiero" />
          {isLoading ? (
            <div className="space-y-4 py-2">{[1,2,3].map(i => <div key={i} className="h-6 rounded bg-[var(--color-dashboard-border)] animate-pulse" />)}</div>
          ) : data && (
            <>
              <div className="space-y-0">
                {[
                  { label: "Ingresos", value: formatCurrency(data.financial.revenue, config), color: "var(--color-status-success)" },
                  { label: "Costo", value: formatCurrency(data.financial.cost, config), color: "var(--color-status-error)" },
                  { label: "Ganancia Real", value: formatCurrency(data.financial.profit, config), color: "var(--color-brand-500)" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-3 border-b border-[var(--color-dashboard-border)] last:border-b-0">
                    <span className="text-sm text-[var(--color-text-secondary)]">{row.label}</span>
                    <span className="text-sm font-bold" style={{ color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--color-dashboard-border)]">
                <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-2">
                  <span>Margen de ganancia</span>
                  <span className="font-semibold text-[var(--color-brand-500)]">
                    {data.financial.revenue > 0 ? `${Math.round((data.financial.profit / data.financial.revenue) * 100)}%` : "0%"}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-dashboard-border)] overflow-hidden">
                  <div className="h-full rounded-full bg-[var(--color-brand-500)] transition-all duration-500"
                    style={{ width: `${data.financial.revenue > 0 ? (data.financial.profit / data.financial.revenue) * 100 : 0}%` }} />
                </div>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Fila 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card padding={false}>
          <div className="p-5 pb-0"><CardHeader title="Pedidos Recientes" /></div>
          {isLoading ? (
            <div className="p-5 space-y-3">{Array.from({length:4}).map((_,i) => <div key={i} className="h-8 rounded bg-[var(--color-dashboard-border)] animate-pulse" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[var(--color-dashboard-border)]">
                  {["ID","Cliente","Total","Estado"].map(h => <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)]">{h}</th>)}
                </tr></thead>
                <tbody>
                  {data?.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-[var(--color-dashboard-border)] last:border-b-0 hover:bg-[var(--color-dashboard-surface-hover)] transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-[var(--color-brand-500)] font-semibold">{order.id.slice(0,8)}</td>
                      <td className="px-5 py-3 text-[var(--color-text-primary)]">{order.clientName}</td>
                      <td className="px-5 py-3 text-[var(--color-text-secondary)] font-semibold">{formatCurrency(order.total, config)}</td>
                      <td className="px-5 py-3"><Badge variant={statusVariant[order.status] || "default"}>{order.status.toUpperCase()}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card><CardHeader title="Alertas de Inventario" />
          {isLoading ? (
            <div className="space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="h-12 rounded bg-[var(--color-dashboard-border)] animate-pulse" />)}</div>
          ) : data?.inventoryAlerts.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-4">Todo el inventario está en niveles normales</p>
          ) : (
            <div className="space-y-3">
              {data?.inventoryAlerts.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-dashboard-border)]">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{a.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Stock: {a.stock} / Mínimo: {a.minStock}</p>
                  </div>
                  <Badge variant={a.status === "agotado" ? "error" : "warning"}>{a.status === "agotado" ? "AGOTADO" : "BAJO STOCK"}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
