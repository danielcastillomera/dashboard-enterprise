"use client";

import { useState, useEffect, useCallback } from "react";
import useSWR, { mutate } from "swr";
import { Plus, Search, Edit2, Trash2, Users } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { useToast } from "@/components/ui/toast";
import { TIPOS_IDENTIFICACION } from "@/lib/billing/clave-acceso";

interface Customer {
  id: string;
  tipoIdentificacion: string;
  identificacion: string;
  razonSocial: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ClientesPage() {
  const { data: customers = [], error } = useSWR<Customer[]>("/api/customers", fetcher);
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    tipoIdentificacion: "05", identificacion: "", razonSocial: "",
    direccion: "", telefono: "", email: "",
  });

  const resetForm = useCallback(() => {
    setForm({ tipoIdentificacion: "05", identificacion: "", razonSocial: "", direccion: "", telefono: "", email: "" });
    setEditing(null);
    setShowForm(false);
  }, []);

  const handleEdit = (c: Customer) => {
    setForm({
      tipoIdentificacion: c.tipoIdentificacion, identificacion: c.identificacion,
      razonSocial: c.razonSocial, direccion: c.direccion || "", telefono: c.telefono || "", email: c.email || "",
    });
    setEditing(c);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.identificacion || !form.razonSocial) {
      addToast({ message: "Complete los campos obligatorios", variant: "info" });
      return;
    }

    const url = editing ? `/api/customers` : "/api/customers";
    const method = editing ? "PUT" : "POST";
    const body = editing ? { id: editing.id, ...form } : form;

    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error");
      }
      addToast({ message: editing ? "Cliente actualizado" : "Cliente creado exitosamente", variant: "success" });
      resetForm();
      mutate("/api/customers");
    } catch (err) {
      addToast({ message: err instanceof Error ? err.message : "Error", variant: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este cliente?")) return;
    try {
      await fetch(`/api/customers`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      addToast({ message: "Cliente eliminado", variant: "success" });
      mutate("/api/customers");
    } catch { addToast({ message: "Error al eliminar", variant: "error" }); }
  };

  const filtered = (customers || []).filter((c: Customer) =>
    c.razonSocial.toLowerCase().includes(search.toLowerCase()) ||
    c.identificacion.includes(search)
  );

  const columns: Column<Customer>[] = [
    {
      key: "tipo", header: "Tipo ID",
      sortValue: (c) => c.tipoIdentificacion,
      render: (c) => <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-brand-500)]/10 text-[var(--color-brand-500)]">{TIPOS_IDENTIFICACION[c.tipoIdentificacion] || c.tipoIdentificacion}</span>
    },
    { key: "id", header: "Identificación", sortValue: (c) => c.identificacion, render: (c) => <span className="font-mono text-sm">{c.identificacion}</span> },
    { key: "name", header: "Razón Social", sortValue: (c) => c.razonSocial, render: (c) => <span className="font-medium text-[var(--color-text-primary)]">{c.razonSocial}</span> },
    { key: "email", header: "Email", render: (c) => <span className="text-[var(--color-text-muted)]">{c.email || "—"}</span> },
    { key: "phone", header: "Teléfono", render: (c) => <span className="text-[var(--color-text-muted)]">{c.telefono || "—"}</span> },
    {
      key: "actions", header: "Acciones", sortable: false,
      render: (c) => (
        <div className="flex gap-1">
          <button onClick={() => handleEdit(c)} className="p-1.5 rounded hover:bg-[var(--color-brand-500)]/10 text-[var(--color-brand-500)]" title="Editar"><Edit2 size={14} /></button>
          <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded hover:bg-red-500/10 text-red-500" title="Eliminar"><Trash2 size={14} /></button>
        </div>
      )
    },
  ];

  const inputCls = "w-full px-3 py-2 rounded-lg bg-[var(--color-dashboard-input)] border border-[var(--color-dashboard-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2"><Users size={24} /> Gestión de Clientes</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{filtered.length} clientes registrados</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-brand-500)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> Nuevo Cliente
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] p-6">
          <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">{editing ? "Editar Cliente" : "Nuevo Cliente"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Tipo de Identificación *</label>
              <select value={form.tipoIdentificacion} onChange={e => setForm(f => ({ ...f, tipoIdentificacion: e.target.value }))} className={inputCls}>
                {Object.entries(TIPOS_IDENTIFICACION).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Identificación *</label>
              <input value={form.identificacion} onChange={e => setForm(f => ({ ...f, identificacion: e.target.value }))} placeholder="0931661482" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Razón Social / Nombre *</label>
              <input value={form.razonSocial} onChange={e => setForm(f => ({ ...f, razonSocial: e.target.value }))} placeholder="Nombre completo o razón social" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Dirección</label>
              <input value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} placeholder="Dirección del cliente" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Teléfono</label>
              <input value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} placeholder="0981076185" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Email</label>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" placeholder="cliente@email.com" className={inputCls} />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleSubmit} className="px-5 py-2 rounded-lg bg-[var(--color-brand-500)] text-white text-sm font-medium hover:opacity-90">{editing ? "Actualizar" : "Guardar"}</button>
            <button onClick={resetForm} className="px-5 py-2 rounded-lg border border-[var(--color-dashboard-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-dashboard-surface-hover)]">Cancelar</button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o identificación..." className={`${inputCls} pl-9 max-w-md`} />
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No hay clientes registrados" caption="Lista de clientes" />
    </div>
  );
}
