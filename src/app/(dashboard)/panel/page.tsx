"use client";

import { useState } from "react";
import {
  ShoppingCart,
  DollarSign,
  BarChart3,
  Boxes,
  TrendingUp,
  AlertTriangle,
  Package,
} from "lucide-react";
import { StatCard, Card, CardHeader, PageHeader, Badge } from "@/components/ui";
import { SalesTrendChart, CategoryChart, TopProductsChart } from "@/components/charts";
import { getActiveTenantConfig, formatCurrency } from "@/lib/tenant-config";
import {
  getDashboardKPIs,
  getFinancialSummary,
  getMonthlySalesData,
  getCategorySalesData,
  getTopProducts,
  getRecentOrders,
  getInventoryAlerts,
} from "@/lib/mock-data";

// Mapa de iconos para las KPI cards
const iconMap: Record<string, React.ReactNode> = {
  Boxes: <Boxes size={20} />,
  DollarSign: <DollarSign size={20} />,
  TrendingUp: <TrendingUp size={20} />,
  ShoppingCart: <ShoppingCart size={20} />,
  BarChart3: <BarChart3 size={20} />,
  AlertTriangle: <AlertTriangle size={20} />,
  Package: <Package size={20} />,
};

type TimeFilter = "Hoy" | "Semana" | "Mes" | "Año";

export default function PanelPage() {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("Mes");
  const config = getActiveTenantConfig();

  const kpis = getDashboardKPIs();
  const financial = getFinancialSummary();
  const monthlySales = getMonthlySalesData();
  const categorySales = getCategorySalesData();
  const topProducts = getTopProducts(5);
  const recentOrders = getRecentOrders(5);
  const inventoryAlerts = getInventoryAlerts();

  const statusVariant: Record<string, "success" | "warning" | "error" | "info"> = {
    pendiente: "warning",
    pagado: "info",
    enviado: "info",
    entregado: "success",
    cancelado: "error",
  };

  return (
    <div>
      <PageHeader
        title="Panel de Control"
        description={`Resumen general de ${config.name}`}
      />

      {/* Filtros de tiempo */}
      <div className="flex gap-2 mb-6" role="group" aria-label="Filtro de período">
        {(["Hoy", "Semana", "Mes", "Año"] as TimeFilter[]).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer
              ${
                activeFilter === filter
                  ? "bg-[var(--color-brand-500)] text-white"
                  : "text-[var(--color-text-secondary)] border border-[var(--color-dashboard-border)] hover:border-[var(--color-brand-500)]/50"
              }
            `}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {kpis.map((kpi) => (
          <StatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            icon={iconMap[kpi.icon] || <Package size={20} />}
            trend={kpi.trend}
            color={kpi.color}
          />
        ))}
      </div>

      {/* Gráficos - fila 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Tendencia de ventas */}
        <Card>
          <CardHeader title="Tendencia de Ventas (6 meses)" />
          <SalesTrendChart data={monthlySales} />
        </Card>

        {/* Distribución por categoría */}
        <Card>
          <CardHeader title="Ventas por Categoría" />
          <CategoryChart data={categorySales} />
        </Card>
      </div>

      {/* Gráficos - fila 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Top productos */}
        <Card>
          <CardHeader title="Top 5 Más Vendidos" />
          <TopProductsChart data={topProducts} />
        </Card>

        {/* Resumen financiero */}
        <Card>
          <CardHeader title="Resumen Financiero" />
          <div className="space-y-0">
            {[
              { label: "Ingresos", value: formatCurrency(financial.revenue, config), color: "var(--color-status-success)" },
              { label: "Costo", value: formatCurrency(financial.cost, config), color: "var(--color-status-error)" },
              { label: "Ganancia Real", value: formatCurrency(financial.profit, config), color: "var(--color-brand-500)" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center py-3 border-b border-[var(--color-dashboard-border)] last:border-b-0">
                <span className="text-sm text-[var(--color-text-secondary)]">{row.label}</span>
                <span className="text-sm font-bold" style={{ color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Margen de ganancia visual */}
          <div className="mt-4 pt-4 border-t border-[var(--color-dashboard-border)]">
            <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-2">
              <span>Margen de ganancia</span>
              <span className="font-semibold text-[var(--color-brand-500)]">
                {financial.revenue > 0
                  ? `${Math.round((financial.profit / financial.revenue) * 100)}%`
                  : "0%"}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--color-dashboard-border)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--color-brand-500)] transition-all duration-500"
                style={{
                  width: `${financial.revenue > 0 ? (financial.profit / financial.revenue) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Fila 3 - Pedidos recientes + Alertas inventario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pedidos recientes */}
        <Card padding={false}>
          <div className="p-5 pb-0">
            <CardHeader title="Pedidos Recientes" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-dashboard-border)]">
                  {["ID", "Cliente", "Total", "Estado"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[var(--color-dashboard-border)] last:border-b-0 hover:bg-[var(--color-dashboard-surface-hover)] transition-colors"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-[var(--color-brand-500)] font-semibold">
                      {order.id}
                    </td>
                    <td className="px-5 py-3 text-[var(--color-text-primary)]">
                      {order.clientName}
                    </td>
                    <td className="px-5 py-3 text-[var(--color-text-secondary)] font-semibold">
                      {formatCurrency(order.total, config)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={statusVariant[order.status] || "default"}>
                        {order.status.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Alertas de inventario */}
        <Card>
          <CardHeader title="Alertas de Inventario" />
          {inventoryAlerts.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
              Todo el inventario está en niveles normales
            </p>
          ) : (
            <div className="space-y-3">
              {inventoryAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-dashboard-border)]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {alert.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Stock: {alert.stock} / Mínimo: {alert.minStock}
                    </p>
                  </div>
                  <Badge variant={alert.status === "agotado" ? "error" : "warning"}>
                    {alert.status === "agotado" ? "AGOTADO" : "BAJO STOCK"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
