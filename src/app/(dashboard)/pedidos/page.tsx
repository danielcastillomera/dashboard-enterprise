"use client";

import { useState, useMemo } from "react";
import { Download, FileText, FileSpreadsheet, Search, Calendar, Eye, X } from "lucide-react";
import { PageHeader, Card, Badge, Button, ErrorState } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/data-table";
import { FilterBar } from "@/components/ui/filter-bar";
import { getActiveTenantConfig, formatCurrency } from "@/lib/tenant-config";
import { useExport } from "@/lib/use-export";
import { useData } from "@/lib/hooks/use-data";
import { useToast } from "@/components/ui";
import { updateOrderStatusAction } from "@/lib/actions/data";

interface OrderItem { productId: string; productName: string; quantity: number; unitPrice: number; subtotal: number; }
interface Order {
  id: string; clientName: string; clientEmail?: string; deliveryAddress?: string;
  items: OrderItem[]; subtotal: number; shipping: number; total: number;
  status: string; date: string | Date; tenantId: string;
}

export default function PedidosPage() {
  const config = getActiveTenantConfig();
  const { handleExportCSV: exportCSV, handleExportPDF: exportPDF } = useExport();
  const { addToast, updateToast } = useToast();
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<(Order & { date: Date }) | null>(null);

  const { data, isLoading, error, mutate } = useData<{ orders: Order[] }>("/api/orders");

  const orders = useMemo(() => {
    if (!data?.orders) return [];
    return data.orders.map(o => ({ ...o, date: new Date(o.date) })).filter(o => {
      if (statusFilter !== "Todos" && o.status !== statusFilter.toLowerCase()) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!o.clientName.toLowerCase().includes(q) && !o.id.toLowerCase().includes(q)) return false;
      }
      if (dateFrom && o.date < new Date(dateFrom)) return false;
      if (dateTo && o.date > new Date(dateTo + "T23:59:59")) return false;
      return true;
    });
  }, [data, statusFilter, search, dateFrom, dateTo]);

  const exportColumns = [
    { key: "id", header: "ID" }, { key: "clientName", header: "Cliente" },
    { key: "total", header: "Total" }, { key: "status", header: "Estado" }, { key: "date", header: "Fecha" },
  ];

  function handleExportCSV() { exportCSV(orders as unknown as Record<string, unknown>[], exportColumns, `pedidos_${new Date().toISOString().split("T")[0]}`); setShowExportMenu(false); }
  async function handleExportPDF() { await exportPDF(orders as unknown as Record<string, unknown>[], exportColumns, `Pedidos — ${config.name}`, `pedidos_${new Date().toISOString().split("T")[0]}`); setShowExportMenu(false); }

  async function handleStatusChange(orderId: string, newStatus: string) {
    const toastId = addToast({ message: "Actualizando estado...", variant: "loading" });
    const result = await updateOrderStatusAction(orderId, newStatus);
    updateToast(toastId, { message: result.message, variant: result.success ? "success" : "error" });
    if (result.success) mutate();
  }

  const statusVariant: Record<string, "success" | "warning" | "error" | "info"> = {
    pendiente: "warning", pagado: "info", enviado: "info", entregado: "success", cancelado: "error",
  };

  const columns: Column<Order & { date: Date }>[] = [
    { key: "id", header: "ID", render: (v) => <span className="font-mono text-xs text-[var(--color-brand-500)]">{v.id.slice(0,8)}</span> },
    { key: "clientName", header: "Cliente", render: (v) => <span className="font-medium text-[var(--color-text-primary)]">{v.clientName}</span> },
    { key: "items", header: "Items", render: (v) => <span>{v.items?.length || 0}</span> },
    { key: "total", header: "Total", render: (v) => <span className="font-bold">{formatCurrency(v.total, config)}</span> },
    { key: "status", header: "Estado", render: (v) => <Badge variant={statusVariant[v.status] || "default"}>{v.status.toUpperCase()}</Badge> },
    { key: "date", header: "Fecha", render: (v) => v.date.toLocaleDateString("es-EC") },
    { key: "actions", header: "Acción", render: (v) => (
      <button onClick={() => setSelectedOrder(v)} className="text-xs text-[var(--color-brand-500)] hover:underline font-semibold">VER DETALLE</button>
    )},
  ];

  if (error) return <ErrorState message={error} onRetry={mutate} />;

  return (
    <div>
      <PageHeader title="Gestión de Pedidos Online" description={`${orders.length} pedidos`}
        actions={
          <div className="flex gap-2">
            <div className="relative">
              <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={() => setShowExportMenu(!showExportMenu)}>Exportar</Button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] shadow-lg py-1 z-50">
                  <button onClick={handleExportCSV} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)] transition-colors"><FileSpreadsheet size={14} className="text-green-500" /> CSV</button>
                  <button onClick={handleExportPDF} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)] transition-colors"><FileText size={14} className="text-red-500" /> PDF</button>
                </div>
              )}
            </div>
          </div>
        } />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar pedido o cliente..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[var(--color-dashboard-border)] bg-[var(--color-dashboard-surface)] text-[var(--color-text-primary)]" />
        </div>
        <FilterBar filters={["Todos", "Pendiente", "Pagado", "Enviado", "Entregado", "Cancelado"]} active={statusFilter} onFilter={setStatusFilter} label="Filtros de estado" />
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-[var(--color-text-muted)]" />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-2 py-1 text-xs rounded-lg border border-[var(--color-dashboard-border)] bg-[var(--color-dashboard-surface)] text-[var(--color-text-primary)]" />
          <span className="text-xs text-[var(--color-text-muted)]">—</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-2 py-1 text-xs rounded-lg border border-[var(--color-dashboard-border)] bg-[var(--color-dashboard-surface)] text-[var(--color-text-primary)]" />
          {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-[10px] text-[var(--color-brand-500)] hover:underline">Limpiar</button>}
        </div>
      </div>

      <Card padding={false}>
        <DataTable columns={columns} data={orders} isLoading={isLoading} emptyMessage="No hay pedidos" caption="Gestión de pedidos" />
      </Card>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-lg mx-4 bg-[var(--color-dashboard-surface)] rounded-2xl border border-[var(--color-dashboard-border)] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-dashboard-border)]">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">DETALLE DE PEDIDO #{selectedOrder.id.slice(0,8).toUpperCase()}</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1 rounded hover:bg-[var(--color-dashboard-surface-hover)]"><X size={16} /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[var(--color-brand-500)]">Datos del Cliente</p>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{selectedOrder.clientName}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{selectedOrder.date.toLocaleDateString("es-EC")}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[var(--color-brand-500)]">Dirección de Entrega</p>
                  <p className="text-sm text-[var(--color-text-primary)]">{selectedOrder.deliveryAddress || "Sin especificar"}</p>
                </div>
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-[var(--color-dashboard-border)]">
                    <th className="text-left py-2 text-xs font-semibold text-[var(--color-text-muted)]">Producto</th>
                    <th className="text-center py-2 text-xs font-semibold text-[var(--color-text-muted)]">Cant.</th>
                    <th className="text-right py-2 text-xs font-semibold text-[var(--color-text-muted)]">Precio</th>
                    <th className="text-right py-2 text-xs font-semibold text-[var(--color-text-muted)]">Subtotal</th>
                  </tr></thead>
                  <tbody>
                    {selectedOrder.items.map((item, i) => (
                      <tr key={i} className="border-b border-[var(--color-dashboard-border)] last:border-b-0">
                        <td className="py-2 text-[var(--color-text-primary)]">{item.productName}</td>
                        <td className="py-2 text-center">{item.quantity}</td>
                        <td className="py-2 text-right">{formatCurrency(item.unitPrice, config)}</td>
                        <td className="py-2 text-right font-semibold">{formatCurrency(item.subtotal, config)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div className="border-t border-[var(--color-dashboard-border)] pt-3 space-y-1">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(selectedOrder.subtotal, config)}</span></div>
                <div className="flex justify-between text-sm"><span>Envío</span><span>{formatCurrency(selectedOrder.shipping, config)}</span></div>
                <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-[var(--color-dashboard-border)]">
                  <span>TOTAL</span><span className="text-[var(--color-brand-500)]">{formatCurrency(selectedOrder.total, config)}</span>
                </div>
              </div>

              {/* Status change */}
              <div className="flex items-center gap-2 pt-2">
                <label className="text-xs font-semibold text-[var(--color-text-muted)]">Estado:</label>
                <select value={selectedOrder.status} onChange={e => { handleStatusChange(selectedOrder.id, e.target.value); setSelectedOrder({ ...selectedOrder, status: e.target.value }); }}
                  className="px-2 py-1 text-xs rounded-lg border border-[var(--color-dashboard-border)] bg-[var(--color-dashboard-surface)] text-[var(--color-text-primary)]">
                  {["pendiente","pagado","enviado","entregado","cancelado"].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-[var(--color-dashboard-border)]">
              <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(null)}>Cerrar Detalle</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
