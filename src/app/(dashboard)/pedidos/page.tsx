"use client";

import { useState } from "react";
import { Search, Eye, X, Download, FileText, FileSpreadsheet, Calendar } from "lucide-react";
import { PageHeader, Badge, Button, FilterBar, DataTable, type Column } from "@/components/ui";
import { getActiveTenantConfig, formatCurrency, formatDate } from "@/lib/tenant-config";
import { mockOrders } from "@/lib/mock-data";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";
import type { Order } from "@/types";

export default function PedidosPage() {
  const config = getActiveTenantConfig();
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const statusVariant: Record<string, "success" | "warning" | "error" | "info"> = {
    pendiente: "warning", pagado: "info", enviado: "info", entregado: "success", cancelado: "error",
  };

  const filtered = mockOrders
    .filter((o) => filter === "Todos" || o.status === filter.toLowerCase())
    .filter((o) => !search || o.clientName.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()))
    .filter((o) => {
      if (dateFrom && o.date < new Date(dateFrom)) return false;
      if (dateTo && o.date > new Date(dateTo + "T23:59:59")) return false;
      return true;
    });

  const exportColumns = [
    { key: "id", header: "ID Pedido" },
    { key: "clientName", header: "Cliente" },
    { key: "total", header: "Total" },
    { key: "status", header: "Estado" },
    { key: "date", header: "Fecha" },
  ];

  function handleExportCSV() {
    exportToCSV(filtered as unknown as Record<string, unknown>[], exportColumns, `pedidos_${new Date().toISOString().split("T")[0]}`);
    setShowExportMenu(false);
  }
  async function handleExportPDF() {
    await exportToPDF(filtered as unknown as Record<string, unknown>[], exportColumns, `Pedidos — ${config.name}`, `pedidos_${new Date().toISOString().split("T")[0]}`);
    setShowExportMenu(false);
  }

  const columns: Column<Order>[] = [
    {
      key: "id",
      header: "ID PEDIDO",
      render: (o) => <span className="font-mono text-xs text-[var(--color-brand-500)] font-semibold">{o.id}</span>,
    },
    {
      key: "client",
      header: "CLIENTE",
      render: (o) => <span className="text-[var(--color-text-primary)] font-medium">{o.clientName}</span>,
    },
    {
      key: "total",
      header: "TOTAL",
      render: (o) => <span className="text-[var(--color-text-primary)] font-semibold">{formatCurrency(o.total, config)}</span>,
    },
    {
      key: "status",
      header: "ESTADO",
      render: (o) => <Badge variant={statusVariant[o.status] || "default"}>{o.status.toUpperCase()}</Badge>,
    },
    {
      key: "date",
      header: "FECHA",
      render: (o) => <span className="text-[var(--color-text-muted)] text-xs">{formatDate(o.date, config)}</span>,
    },
    {
      key: "actions",
      header: "ACCIÓN",
      render: (o) => (
        <Button variant="ghost" size="sm" icon={<Eye size={14} />} onClick={() => setSelectedOrder(o)}>
          Ver
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Gestión de Pedidos Online"
        description={`${filtered.length} pedidos encontrados`}
        actions={
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
        }
      />

      {/* Filtros avanzados: búsqueda + rango de fechas */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar pedido o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar pedido o cliente"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-500)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-[var(--color-text-muted)]" />
          <input
            type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            aria-label="Fecha desde"
            className="px-2 py-2 text-xs rounded-lg bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-500)]"
          />
          <span className="text-xs text-[var(--color-text-muted)]">—</span>
          <input
            type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            aria-label="Fecha hasta"
            className="px-2 py-2 text-xs rounded-lg bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-500)]"
          />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-xs text-[var(--color-status-error)] hover:underline">Limpiar</button>
          )}
        </div>
      </div>

      <FilterBar filters={["Todos", "Pendiente", "Pagado", "Enviado", "Entregado"]} active={filter} onFilter={setFilter} />

      <DataTable columns={columns} data={filtered} emptyMessage="No hay pedidos con estos filtros" caption="Tabla de pedidos" />

      {/* Modal de detalle */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Detalle del pedido">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] shadow-[var(--shadow-dropdown)] p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">Detalle de Pedido</h3>
                <p className="text-xs font-mono text-[var(--color-brand-500)]">{selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} aria-label="Cerrar detalle" className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)]">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Cliente</span>
                <span className="text-[var(--color-text-primary)] font-medium">{selectedOrder.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Dirección</span>
                <span className="text-[var(--color-text-primary)]">{selectedOrder.deliveryAddress || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Fecha</span>
                <span className="text-[var(--color-text-primary)]">{formatDate(selectedOrder.date, config)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Estado</span>
                <Badge variant={statusVariant[selectedOrder.status]}>{selectedOrder.status.toUpperCase()}</Badge>
              </div>
              <div className="border-t border-[var(--color-dashboard-border)] pt-3">
                <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
                  <span>Subtotal</span><span>{formatCurrency(selectedOrder.subtotal, config)}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
                  <span>Envío</span><span>{formatCurrency(selectedOrder.shipping, config)}</span>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-[var(--color-dashboard-border)]">
                  <span className="font-bold text-[var(--color-text-primary)]">TOTAL</span>
                  <span className="font-bold text-[var(--color-brand-500)]">{formatCurrency(selectedOrder.total, config)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => setSelectedOrder(null)}>Cerrar</Button>
              <Button size="sm" className="flex-1">Imprimir Ticket</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
