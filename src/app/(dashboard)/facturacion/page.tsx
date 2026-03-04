"use client";

import { useState, useMemo } from "react";
import { FileText, Plus, Search, Eye, Download, X, Trash2, Receipt, DollarSign, AlertCircle, CheckCircle2, Lock, Mail } from "lucide-react";
import { PageHeader, Card, StatCard, ErrorState } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/data-table";
import { useToast } from "@/components/ui/toast";
import { FullScreenLoader } from "@/components/ui/fullscreen-loader";
import { useData, invalidateCache } from "@/lib/hooks/use-data";
import { getActiveTenantConfig, formatCurrency } from "@/lib/tenant-config";
import { FORMAS_PAGO, IVA_CODES } from "@/lib/billing/clave-acceso";

/* ============================================
   TYPES
   ============================================ */
interface Customer {
  id: string; tipoIdentificacion: string; identificacion: string;
  razonSocial: string; email?: string; direccion?: string;
}

interface Product {
  id: string; code?: string; name: string; price: number; stock: number;
}

interface LineItem {
  codigoPrincipal: string; descripcion: string;
  cantidad: number; precioUnitario: number; descuento: number; ivaCode: string;
}

interface Invoice {
  id: string; invoiceNumber: string; fechaEmision: string;
  estado: string; importeTotal: number; subtotalSinImpuestos: number;
  iva15: number; totalDescuento: number; formaPagoDescripcion?: string;
  claveAcceso?: string; emailSent: boolean;
  customer?: Customer;
}

/* ============================================
   PAGE
   ============================================ */
export default function FacturacionPage() {
  const config = getActiveTenantConfig();
  const { data: rawInvoices, isLoading: loadingInv, error: errorInv, mutate: mutateInv } = useData<Invoice[]>("/api/invoices");
  const { data: statsRaw } = useData<Record<string, number>>("/api/invoices?stats=true");
  const { data: rawCustomers } = useData<Customer[]>("/api/customers");
  const { data: productsRaw } = useData<{ products: Product[] }>("/api/products");
  const { addToast } = useToast();

  // Safely extract arrays
  const invoices: Invoice[] = Array.isArray(rawInvoices) ? rawInvoices : [];
  const customers: Customer[] = Array.isArray(rawCustomers) ? rawCustomers : [];
  const products: Product[] = productsRaw?.products && Array.isArray(productsRaw.products) ? productsRaw.products : [];
  const stats = (statsRaw && typeof statsRaw === "object" && !Array.isArray(statsRaw)) ? statsRaw : null;

  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [formaPago, setFormaPago] = useState("01");
  const [items, setItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState("");

  const addItem = () => {
    setItems([...items, { codigoPrincipal: "", descripcion: "", cantidad: 1, precioUnitario: 0, descuento: 0, ivaCode: "4" }]);
  };

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const updateItem = (idx: number, field: string, value: string | number) => {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const addProductLine = (p: Product) => {
    setItems([...items, {
      codigoPrincipal: p.code || p.id.slice(0, 8).toUpperCase(),
      descripcion: p.name,
      cantidad: 1,
      precioUnitario: p.price,
      descuento: 0,
      ivaCode: "4",
    }]);
  };

  /* ---- Tax Calculation ---- */
  const totals = useMemo(() => {
    let sub15 = 0, sub0 = 0, desc = 0;
    for (const item of items) {
      const line = item.cantidad * item.precioUnitario - item.descuento;
      desc += item.descuento;
      if (item.ivaCode === "4") sub15 += line; else sub0 += line;
    }
    const subSinImp = sub15 + sub0;
    const iva = Math.round(sub15 * 0.15 * 100) / 100;
    const total = Math.round((subSinImp + iva) * 100) / 100;
    return { sub15, sub0, subSinImp, desc, iva, total };
  }, [items]);

  /* ---- Submit ---- */
  const handleCreate = async () => {
    if (!selectedCustomer) { addToast({ message: "Seleccione un cliente", variant: "info" }); return; }
    if (items.length === 0) { addToast({ message: "Agregue al menos un producto", variant: "info" }); return; }
    if (items.some(i => !i.descripcion || i.precioUnitario <= 0)) { addToast({ message: "Complete todos los productos", variant: "info" }); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: selectedCustomer, formaPago, items, notes }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Error al crear factura");
      addToast({ message: `Factura ${data.invoiceNumber || ""} emitida`, variant: "success" });
      setShowForm(false);
      setItems([]);
      setSelectedCustomer("");
      setNotes("");
      invalidateCache("/api/invoices");
      mutateInv();
    } catch (err) {
      addToast({ message: err instanceof Error ? err.message : "Error", variant: "error" });
    } finally { setSaving(false); }
  };

  const filtered = invoices.filter(inv =>
    (inv.invoiceNumber || "").includes(search) ||
    (inv.customer?.razonSocial || "").toLowerCase().includes(search.toLowerCase())
  );

  /* ---- Invoice Table Columns ---- */
  const columns: Column<Invoice>[] = [
    { key: "num", header: "Factura", sortValue: i => i.invoiceNumber, render: i => <span className="font-mono font-medium text-[var(--color-brand-500)]">{i.invoiceNumber}</span> },
    { key: "cli", header: "Cliente", sortValue: i => i.customer?.razonSocial || "", render: i => <span className="text-[var(--color-text-primary)]">{i.customer?.razonSocial || "—"}</span> },
    { key: "date", header: "Fecha", sortValue: i => i.fechaEmision, render: i => <span className="text-[var(--color-text-muted)] text-sm">{i.fechaEmision ? new Date(i.fechaEmision).toLocaleDateString("es-EC") : "—"}</span> },
    { key: "total", header: "Total", sortValue: i => i.importeTotal, render: i => <span className="font-semibold">{formatCurrency(i.importeTotal || 0, config)}</span> },
    {
      key: "estado", header: "Estado", sortValue: i => i.estado,
      render: i => {
        const c: Record<string,string> = { EMITIDA: "bg-green-500/10 text-green-500", CREADA: "bg-yellow-500/10 text-yellow-500", ANULADA: "bg-red-500/10 text-red-500", AUTORIZADA: "bg-blue-500/10 text-blue-500" };
        return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c[i.estado] || "bg-gray-500/10 text-gray-500"}`}>{i.estado || "—"}</span>;
      },
    },
    {
      key: "actions", header: "Acciones", sortable: false,
      render: i => {
        const isEmitida = i.estado === "EMITIDA" || i.estado === "AUTORIZADA";
        return (
          <div className="flex gap-1 items-center">
            <button className="p-1.5 rounded hover:bg-[var(--color-brand-500)]/10 text-[var(--color-brand-500)]" title="Descargar PDF"><Download size={14} /></button>
            <button className="p-1.5 rounded hover:bg-blue-500/10 text-blue-500" title="Ver XML"><FileText size={14} /></button>
            {isEmitida && (
              <span
                className="p-1.5 rounded text-[var(--color-text-muted)] cursor-help"
                title="Las facturas emitidas no pueden ser modificadas según la normativa del SRI Ecuador"
              >
                <Lock size={13} />
              </span>
            )}
          </div>
        );
      },
    },
  ];

  const inp = "w-full px-3 py-2.5 rounded-lg bg-[var(--color-dashboard-input)] border border-[var(--color-dashboard-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] placeholder:text-[var(--color-text-muted)]/40";
  const selectedCust = customers.find(c => c.id === selectedCustomer);

  /* ---- Loading / Error ---- */
  if (loadingInv) return <FullScreenLoader state="loading" message="Cargando facturación..." />;
  if (errorInv) return <ErrorState message={errorInv} onRetry={mutateInv} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel de Facturación"
        description="Facturación electrónica SRI Ecuador"
        actions={
          <button onClick={() => { setShowForm(true); if (items.length === 0) addItem(); }} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-brand-500)] text-white text-sm font-medium hover:opacity-90">
            <Plus size={16} /> Nueva Factura
          </button>
        }
      />

      {/* STATS */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Facturas" value={String(stats.total || 0)} icon={<FileText size={18} />} color="var(--color-brand-500)" />
          <StatCard label="Emitidas" value={String(stats.emitidas || 0)} icon={<CheckCircle2 size={18} />} color="#22c55e" />
          <StatCard label="Anuladas" value={String(stats.anuladas || 0)} icon={<AlertCircle size={18} />} color="#ef4444" />
          <StatCard label="Ingresos" value={formatCurrency(stats.totalRevenue || 0, config)} icon={<DollarSign size={18} />} color="var(--color-brand-500)" />
        </div>
      )}

      {/* CREATE FORM */}
      {showForm && (
        <Card>
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-semibold text-[var(--color-text-primary)] text-lg">Nueva Factura Electrónica</h2>
            <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-[var(--color-dashboard-surface-hover)]"><X size={18} className="text-[var(--color-text-muted)]" /></button>
          </div>

          {/* Customer + Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Cliente *</label>
              <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className={inp} autoComplete="off">
                <option value="">— Seleccione un cliente —</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.identificacion} — {c.razonSocial}</option>)}
              </select>
              {selectedCust && <p className="text-xs text-[var(--color-text-muted)] mt-1">{selectedCust.email || ""} {selectedCust.direccion ? `• ${selectedCust.direccion}` : ""}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Forma de Pago</label>
              <select value={formaPago} onChange={e => setFormaPago(e.target.value)} className={inp}>
                {Object.entries(FORMAS_PAGO).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* Quick Product Add */}
          {products.length > 0 && (
            <div className="mb-5">
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Agregar producto rápido</label>
              <div className="flex gap-2 flex-wrap">
                {products.slice(0, 8).map(p => (
                  <button key={p.id} onClick={() => addProductLine(p)} type="button" className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-dashboard-border)] hover:bg-[var(--color-brand-500)]/10 hover:border-[var(--color-brand-500)] text-[var(--color-text-primary)] transition-colors">
                    {p.name} — {formatCurrency(p.price, config)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Line Items */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-[var(--color-text-muted)]">Detalle de productos</label>
              <button onClick={addItem} type="button" className="text-xs text-[var(--color-brand-500)] hover:underline flex items-center gap-1"><Plus size={12} /> Agregar línea</button>
            </div>
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-[var(--color-dashboard-border)]">
                    <th className="text-left py-2 px-2 text-xs text-[var(--color-text-muted)] font-medium w-24">Código</th>
                    <th className="text-left py-2 px-2 text-xs text-[var(--color-text-muted)] font-medium">Descripción</th>
                    <th className="text-right py-2 px-2 text-xs text-[var(--color-text-muted)] font-medium w-20">Cant.</th>
                    <th className="text-right py-2 px-2 text-xs text-[var(--color-text-muted)] font-medium w-28">P. Unit.</th>
                    <th className="text-right py-2 px-2 text-xs text-[var(--color-text-muted)] font-medium w-24">Desc.</th>
                    <th className="text-center py-2 px-2 text-xs text-[var(--color-text-muted)] font-medium w-28">IVA</th>
                    <th className="text-right py-2 px-2 text-xs text-[var(--color-text-muted)] font-medium w-28">Subtotal</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const lineTotal = item.cantidad * item.precioUnitario - item.descuento;
                    return (
                      <tr key={idx} className="border-b border-[var(--color-dashboard-border)]/50">
                        <td className="py-1.5 px-2"><input value={item.codigoPrincipal} onChange={e => updateItem(idx, "codigoPrincipal", e.target.value)} placeholder="COD" className={`${inp} text-xs !py-1.5`} /></td>
                        <td className="py-1.5 px-2"><input value={item.descripcion} onChange={e => updateItem(idx, "descripcion", e.target.value)} placeholder="Descripción del producto" className={`${inp} text-xs !py-1.5`} /></td>
                        <td className="py-1.5 px-2"><input type="number" value={item.cantidad} onChange={e => updateItem(idx, "cantidad", Number(e.target.value))} min={0.01} step="0.01" className={`${inp} text-xs !py-1.5 text-right`} /></td>
                        <td className="py-1.5 px-2"><input type="number" value={item.precioUnitario} onChange={e => updateItem(idx, "precioUnitario", Number(e.target.value))} min={0} step="0.01" className={`${inp} text-xs !py-1.5 text-right`} /></td>
                        <td className="py-1.5 px-2"><input type="number" value={item.descuento} onChange={e => updateItem(idx, "descuento", Number(e.target.value))} min={0} step="0.01" className={`${inp} text-xs !py-1.5 text-right`} /></td>
                        <td className="py-1.5 px-2">
                          <select value={item.ivaCode} onChange={e => updateItem(idx, "ivaCode", e.target.value)} className={`${inp} text-xs !py-1.5`}>
                            {Object.entries(IVA_CODES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                          </select>
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono text-sm font-medium text-[var(--color-text-primary)]">{formatCurrency(lineTotal, config)}</td>
                        <td className="py-1.5 px-1"><button onClick={() => removeItem(idx)} type="button" className="p-1 rounded hover:bg-red-500/10 text-red-500"><Trash2 size={14} /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals + Notes */}
          <div className="flex flex-col md:flex-row gap-4 justify-between mb-5">
            <div className="flex-1">
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Observaciones</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Notas adicionales (opcional)" className={inp} />
            </div>
            <div className="w-full md:w-72 space-y-1.5 rounded-lg bg-[var(--color-dashboard-bg)] p-4 border border-[var(--color-dashboard-border)]">
              <div className="flex justify-between text-sm"><span className="text-[var(--color-text-muted)]">SUBTOTAL 15%</span><span className="font-mono">{formatCurrency(totals.sub15, config)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[var(--color-text-muted)]">SUBTOTAL 0%</span><span className="font-mono">{formatCurrency(totals.sub0, config)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[var(--color-text-muted)]">DESCUENTO</span><span className="font-mono">{formatCurrency(totals.desc, config)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[var(--color-text-muted)]">IVA 15%</span><span className="font-mono">{formatCurrency(totals.iva, config)}</span></div>
              <div className="border-t border-[var(--color-dashboard-border)] pt-2 flex justify-between text-base font-bold">
                <span className="text-[var(--color-text-primary)]">TOTAL</span>
                <span className="text-[var(--color-brand-500)] font-mono">{formatCurrency(totals.total, config)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[var(--color-dashboard-border)]">
            <button onClick={handleCreate} disabled={saving} type="button" className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--color-brand-500)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {saving ? <><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Emitiendo...</> : <><FileText size={16} /> Emitir Factura</>}
            </button>
            <button onClick={() => setShowPreview(true)} type="button" className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-dashboard-border)] text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)]">
              <Eye size={16} /> Vista Previa
            </button>
            <button onClick={() => { setShowForm(false); setItems([]); }} type="button" className="px-5 py-2.5 rounded-lg border border-[var(--color-dashboard-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-dashboard-surface-hover)]">
              Cancelar
            </button>
          </div>
        </Card>
      )}

      {/* PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 text-black" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs text-gray-500 font-mono tracking-wide">VISTA PREVIA — NO ES DOCUMENTO FISCAL</p>
                <h2 className="text-lg font-bold mt-1 tracking-widest">F A C T U R A</h2>
              </div>
              <button onClick={() => setShowPreview(false)} className="p-1"><X size={20} /></button>
            </div>
            {selectedCust && (
              <div className="border rounded-lg p-3 mb-4 text-sm">
                <p><strong>Cliente:</strong> {selectedCust.razonSocial}</p>
                <p><strong>Identificación:</strong> {selectedCust.identificacion}</p>
                {selectedCust.direccion && <p><strong>Dirección:</strong> {selectedCust.direccion}</p>}
              </div>
            )}
            <table className="w-full text-xs mb-4 border-collapse">
              <thead><tr className="border-b-2 border-gray-300">
                <th className="text-left py-2">Código</th><th className="text-left py-2">Descripción</th>
                <th className="text-right py-2">Cant.</th><th className="text-right py-2">P. Unit.</th>
                <th className="text-right py-2">Desc.</th><th className="text-right py-2">Total</th>
              </tr></thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="py-1.5 font-mono">{item.codigoPrincipal}</td>
                    <td className="py-1.5">{item.descripcion}</td>
                    <td className="py-1.5 text-right">{item.cantidad}</td>
                    <td className="py-1.5 text-right">${item.precioUnitario.toFixed(2)}</td>
                    <td className="py-1.5 text-right">${item.descuento.toFixed(2)}</td>
                    <td className="py-1.5 text-right font-medium">${(item.cantidad * item.precioUnitario - item.descuento).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end">
              <div className="w-64 text-sm space-y-1">
                <div className="flex justify-between"><span>SUBTOTAL 15%</span><span>${totals.sub15.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>SUBTOTAL 0%</span><span>${totals.sub0.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>IVA 15%</span><span>${totals.iva.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-base border-t border-gray-300 pt-2 mt-2">
                  <span>VALOR TOTAL</span><span>${totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-500 text-center">
              Forma de pago: {FORMAS_PAGO[formaPago] || formaPago}
            </div>
          </div>
        </div>
      )}

      {/* SEARCH + LIST */}
      {!showForm && (
        <>
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por número o cliente..." className={`${inp} pl-9`} autoComplete="off" />
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <Card padding={false}>
              <DataTable columns={columns} data={filtered} emptyMessage="No hay facturas emitidas" caption="Historial de facturas" />
            </Card>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.length === 0 ? (
              <Card><p className="text-center text-[var(--color-text-muted)] py-4">No hay facturas emitidas</p></Card>
            ) : filtered.map(inv => (
              <Card key={inv.id}>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono font-medium text-[var(--color-brand-500)] text-sm">{inv.invoiceNumber}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    inv.estado === "EMITIDA" ? "bg-green-500/10 text-green-500" :
                    inv.estado === "ANULADA" ? "bg-red-500/10 text-red-500" :
                    "bg-yellow-500/10 text-yellow-500"
                  }`}>{inv.estado}</span>
                </div>
                <p className="text-sm text-[var(--color-text-primary)]">{inv.customer?.razonSocial || "—"}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-[var(--color-text-muted)]">{inv.fechaEmision ? new Date(inv.fechaEmision).toLocaleDateString("es-EC") : "—"}</span>
                  <span className="font-semibold">{formatCurrency(inv.importeTotal || 0, config)}</span>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
