"use client";

import { useState, useEffect, useMemo } from "react";
import useSWR, { mutate } from "swr";
import {
  FileText, Plus, Search, Eye, Download, Mail, X,
  Trash2, ChevronDown, Receipt, DollarSign, AlertCircle, CheckCircle2,
} from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { useToast } from "@/components/ui/toast";
import { FORMAS_PAGO, IVA_CODES } from "@/lib/billing/clave-acceso";

interface Customer { id: string; tipoIdentificacion: string; identificacion: string; razonSocial: string; email?: string; direccion?: string; telefono?: string; }
interface Product { id: string; code?: string; name: string; price: number; stock: number; }
interface InvoiceItem { codigoPrincipal: string; codigoAuxiliar?: string; descripcion: string; cantidad: number; precioUnitario: number; descuento: number; ivaCode: string; }
interface Invoice {
  id: string; invoiceNumber: string; fechaEmision: string; estado: string; importeTotal: number;
  subtotalSinImpuestos: number; iva15: number; totalDescuento: number;
  formaPagoDescripcion?: string; claveAcceso?: string; emailSent: boolean;
  customer: Customer; items: { descripcion: string; cantidad: number; precioUnitario: number; precioTotalSinImpuesto: number; }[];
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function FacturacionPage() {
  const { data: invoices = [] } = useSWR<Invoice[]>("/api/invoices", fetcher);
  const { data: stats } = useSWR("/api/invoices?stats=true", fetcher);
  const { data: customers = [] } = useSWR<Customer[]>("/api/customers", fetcher);
  const { data: products = [] } = useSWR<Product[]>("/api/products", fetcher);
  const { addToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [formaPago, setFormaPago] = useState("01");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [notes, setNotes] = useState("");

  const addItem = () => {
    setItems([...items, { codigoPrincipal: "", descripcion: "", cantidad: 1, precioUnitario: 0, descuento: 0, ivaCode: "4" }]);
  };

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const updateItem = (idx: number, field: string, value: string | number) => {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const addProductToInvoice = (product: Product) => {
    setItems([...items, {
      codigoPrincipal: product.code || product.id.slice(0, 8).toUpperCase(),
      descripcion: product.name,
      cantidad: 1,
      precioUnitario: product.price,
      descuento: 0,
      ivaCode: "4",
    }]);
  };

  // Real-time tax calculation
  const totals = useMemo(() => {
    let subtotal15 = 0, subtotal0 = 0, totalDesc = 0;
    items.forEach(item => {
      const lineTotal = item.cantidad * item.precioUnitario - item.descuento;
      totalDesc += item.descuento;
      if (item.ivaCode === "4") subtotal15 += lineTotal;
      else subtotal0 += lineTotal;
    });
    const subtotalSinImpuestos = subtotal15 + subtotal0;
    const iva15 = Math.round(subtotal15 * 0.15 * 100) / 100;
    const importeTotal = Math.round((subtotalSinImpuestos + iva15) * 100) / 100;
    return { subtotal15, subtotal0, subtotalSinImpuestos, totalDesc, iva15, importeTotal };
  }, [items]);

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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      addToast({ message: `Factura ${data.invoiceNumber} emitida exitosamente`, variant: "success" });
      setShowForm(false);
      setItems([]);
      setSelectedCustomer("");
      setNotes("");
      mutate("/api/invoices");
      mutate("/api/invoices?stats=true");
    } catch (err) {
      addToast({ message: err instanceof Error ? err.message : "Error al crear factura", variant: "error" });
    } finally { setSaving(false); }
  };

  const filtered = (invoices || []).filter((inv: Invoice) =>
    inv.invoiceNumber.includes(search) ||
    inv.customer?.razonSocial?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Invoice>[] = [
    { key: "number", header: "Factura", sortValue: (i) => i.invoiceNumber, render: (i) => <span className="font-mono font-medium text-[var(--color-brand-500)]">{i.invoiceNumber}</span> },
    { key: "client", header: "Cliente", sortValue: (i) => i.customer?.razonSocial, render: (i) => <span className="text-[var(--color-text-primary)]">{i.customer?.razonSocial || "—"}</span> },
    { key: "date", header: "Fecha", sortValue: (i) => i.fechaEmision, render: (i) => <span className="text-[var(--color-text-muted)] text-sm">{new Date(i.fechaEmision).toLocaleDateString("es-EC")}</span> },
    { key: "total", header: "Total", sortValue: (i) => i.importeTotal, render: (i) => <span className="font-semibold text-[var(--color-text-primary)]">${i.importeTotal.toFixed(2)}</span> },
    {
      key: "status", header: "Estado", sortValue: (i) => i.estado,
      render: (i) => {
        const colors: Record<string, string> = { EMITIDA: "bg-green-500/10 text-green-500", CREADA: "bg-yellow-500/10 text-yellow-500", ANULADA: "bg-red-500/10 text-red-500" };
        return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[i.estado] || "bg-gray-500/10 text-gray-500"}`}>{i.estado}</span>;
      }
    },
    {
      key: "actions", header: "Acciones", sortable: false,
      render: (i) => (
        <div className="flex gap-1">
          <button onClick={() => window.open(`/api/invoices/${i.id}/pdf`, "_blank")} className="p-1.5 rounded hover:bg-[var(--color-brand-500)]/10 text-[var(--color-brand-500)]" title="Descargar PDF"><Download size={14} /></button>
          <button className="p-1.5 rounded hover:bg-blue-500/10 text-blue-500" title="Ver XML"><FileText size={14} /></button>
          {!i.emailSent && i.customer?.email && <button className="p-1.5 rounded hover:bg-purple-500/10 text-purple-500" title="Enviar por email"><Mail size={14} /></button>}
        </div>
      )
    },
  ];

  const inputCls = "w-full px-3 py-2 rounded-lg bg-[var(--color-dashboard-input)] border border-[var(--color-dashboard-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]";

  const selectedCustomerData = customers.find((c: Customer) => c.id === selectedCustomer);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2"><Receipt size={24} /> Panel de Facturación</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Facturación electrónica SRI Ecuador</p>
        </div>
        <button onClick={() => { setShowForm(true); if (items.length === 0) addItem(); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-brand-500)] text-white text-sm font-medium hover:opacity-90">
          <Plus size={16} /> Nueva Factura
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Facturas", value: stats.total || 0, icon: FileText, color: "text-blue-500" },
            { label: "Emitidas", value: stats.emitidas || 0, icon: CheckCircle2, color: "text-green-500" },
            { label: "Anuladas", value: stats.anuladas || 0, icon: AlertCircle, color: "text-red-500" },
            { label: "Ingresos", value: `$${(stats.totalRevenue || 0).toFixed(2)}`, icon: DollarSign, color: "text-[var(--color-brand-500)]" },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--color-text-muted)]">{s.label}</p>
                <s.icon size={16} className={s.color} />
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Creation Form */}
      {showForm && (
        <div className="rounded-xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] p-6 space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-[var(--color-text-primary)] text-lg">Nueva Factura Electrónica</h2>
            <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-[var(--color-dashboard-surface-hover)]"><X size={18} className="text-[var(--color-text-muted)]" /></button>
          </div>

          {/* Customer + Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Cliente *</label>
              <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className={inputCls}>
                <option value="">— Seleccione un cliente —</option>
                {(customers || []).map((c: Customer) => <option key={c.id} value={c.id}>{c.identificacion} — {c.razonSocial}</option>)}
              </select>
              {selectedCustomerData && (
                <p className="text-xs text-[var(--color-text-muted)] mt-1">{selectedCustomerData.email || "Sin email"} • {selectedCustomerData.direccion || "Sin dirección"}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Forma de Pago</label>
              <select value={formaPago} onChange={e => setFormaPago(e.target.value)} className={inputCls}>
                {Object.entries(FORMAS_PAGO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* Quick Product Add */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Agregar producto rápido</label>
            <div className="flex gap-2 flex-wrap">
              {(products || []).slice(0, 10).map((p: Product) => (
                <button key={p.id} onClick={() => addProductToInvoice(p)} className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-dashboard-border)] hover:bg-[var(--color-brand-500)]/10 hover:border-[var(--color-brand-500)] text-[var(--color-text-primary)] transition-colors">
                  {p.name} — ${p.price.toFixed(2)}
                </button>
              ))}
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-[var(--color-text-muted)]">Detalle de productos</label>
              <button onClick={addItem} className="text-xs text-[var(--color-brand-500)] hover:underline flex items-center gap-1"><Plus size={12} /> Agregar línea</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-dashboard-border)]">
                    <th className="text-left py-2 px-2 text-xs text-[var(--color-text-muted)] font-medium">Código</th>
                    <th className="text-left py-2 px-2 text-xs text-[var(--color-text-muted)] font-medium min-w-[200px]">Descripción</th>
                    <th className="text-right py-2 px-2 text-xs text-[var(--color-text-muted)] font-medium w-20">Cant.</th>
                    <th className="text-right py-2 px-2 text-xs text-[var(--color-text-muted)] font-medium w-28">P. Unit.</th>
                    <th className="text-right py-2 px-2 text-xs text-[var(--color-text-muted)] font-medium w-24">Desc.</th>
                    <th className="text-center py-2 px-2 text-xs text-[var(--color-text-muted)] font-medium w-24">IVA</th>
                    <th className="text-right py-2 px-2 text-xs text-[var(--color-text-muted)] font-medium w-28">Subtotal</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const lineTotal = item.cantidad * item.precioUnitario - item.descuento;
                    return (
                      <tr key={idx} className="border-b border-[var(--color-dashboard-border)]/50">
                        <td className="py-1.5 px-2"><input value={item.codigoPrincipal} onChange={e => updateItem(idx, "codigoPrincipal", e.target.value)} placeholder="COD" className={`${inputCls} text-xs !py-1.5`} /></td>
                        <td className="py-1.5 px-2"><input value={item.descripcion} onChange={e => updateItem(idx, "descripcion", e.target.value)} placeholder="Descripción del producto" className={`${inputCls} text-xs !py-1.5`} /></td>
                        <td className="py-1.5 px-2"><input type="number" value={item.cantidad} onChange={e => updateItem(idx, "cantidad", Number(e.target.value))} min={0.01} step="0.01" className={`${inputCls} text-xs !py-1.5 text-right`} /></td>
                        <td className="py-1.5 px-2"><input type="number" value={item.precioUnitario} onChange={e => updateItem(idx, "precioUnitario", Number(e.target.value))} min={0} step="0.01" className={`${inputCls} text-xs !py-1.5 text-right`} /></td>
                        <td className="py-1.5 px-2"><input type="number" value={item.descuento} onChange={e => updateItem(idx, "descuento", Number(e.target.value))} min={0} step="0.01" className={`${inputCls} text-xs !py-1.5 text-right`} /></td>
                        <td className="py-1.5 px-2">
                          <select value={item.ivaCode} onChange={e => updateItem(idx, "ivaCode", e.target.value)} className={`${inputCls} text-xs !py-1.5`}>
                            {Object.entries(IVA_CODES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                          </select>
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono text-sm font-medium text-[var(--color-text-primary)]">${lineTotal.toFixed(2)}</td>
                        <td className="py-1.5 px-1"><button onClick={() => removeItem(idx)} className="p-1 rounded hover:bg-red-500/10 text-red-500"><Trash2 size={14} /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex-1">
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Observaciones</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Notas adicionales (opcional)" className={inputCls} />
            </div>
            <div className="w-full md:w-72 space-y-1.5 rounded-lg bg-[var(--color-dashboard-bg)] p-4 border border-[var(--color-dashboard-border)]">
              <div className="flex justify-between text-sm"><span className="text-[var(--color-text-muted)]">SUBTOTAL 15%</span><span className="font-mono">${totals.subtotal15.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[var(--color-text-muted)]">SUBTOTAL 0%</span><span className="font-mono">${totals.subtotal0.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[var(--color-text-muted)]">SUBTOTAL SIN IMPUESTOS</span><span className="font-mono">${totals.subtotalSinImpuestos.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[var(--color-text-muted)]">DESCUENTO</span><span className="font-mono">${totals.totalDesc.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[var(--color-text-muted)]">IVA 15%</span><span className="font-mono">${totals.iva15.toFixed(2)}</span></div>
              <div className="border-t border-[var(--color-dashboard-border)] pt-2 flex justify-between text-base font-bold">
                <span className="text-[var(--color-text-primary)]">VALOR TOTAL</span>
                <span className="text-[var(--color-brand-500)] font-mono">${totals.importeTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={handleCreate} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-brand-500)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
              <FileText size={16} /> {saving ? "Emitiendo..." : "Emitir Factura"}
            </button>
            <button onClick={() => setShowPreview(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-dashboard-border)] text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)]">
              <Eye size={16} /> Vista Previa
            </button>
            <button onClick={() => { setShowForm(false); setItems([]); }} className="px-5 py-2.5 rounded-lg border border-[var(--color-dashboard-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-dashboard-surface-hover)]">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 text-black" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs text-gray-500 font-mono">VISTA PREVIA — NO ES DOCUMENTO FISCAL</p>
                <h2 className="text-lg font-bold mt-1">F A C T U R A</h2>
              </div>
              <button onClick={() => setShowPreview(false)} className="p-1"><X size={20} /></button>
            </div>

            {selectedCustomerData && (
              <div className="border rounded p-3 mb-4 text-sm">
                <p><strong>Cliente:</strong> {selectedCustomerData.razonSocial}</p>
                <p><strong>Identificación:</strong> {selectedCustomerData.identificacion}</p>
                {selectedCustomerData.direccion && <p><strong>Dirección:</strong> {selectedCustomerData.direccion}</p>}
              </div>
            )}

            <table className="w-full text-xs mb-4 border-collapse">
              <thead><tr className="border-b-2 border-gray-300">
                <th className="text-left py-2">Código</th>
                <th className="text-left py-2">Descripción</th>
                <th className="text-right py-2">Cant.</th>
                <th className="text-right py-2">P. Unit.</th>
                <th className="text-right py-2">Desc.</th>
                <th className="text-right py-2">Total</th>
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
                <div className="flex justify-between"><span>SUBTOTAL 15%</span><span>{totals.subtotal15.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>SUBTOTAL 0%</span><span>{totals.subtotal0.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>IVA 15%</span><span>{totals.iva15.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-base border-t border-gray-300 pt-2 mt-2">
                  <span>VALOR TOTAL</span><span>${totals.importeTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-500 text-center">
              Forma de pago: {FORMAS_PAGO[formaPago]}
            </div>
          </div>
        </div>
      )}

      {/* Search + Invoice List */}
      {!showForm && (
        <>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por número de factura o cliente..." className={`${inputCls} pl-9 max-w-md`} />
          </div>
          <DataTable columns={columns} data={filtered} emptyMessage="No hay facturas emitidas" caption="Historial de facturas" />
        </>
      )}
    </div>
  );
}
