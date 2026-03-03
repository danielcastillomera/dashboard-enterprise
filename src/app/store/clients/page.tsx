"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  FileText,
  ChevronDown,
  ChevronUp,
  Building2,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  tradeName?: string;
  taxId: string;
  taxIdType: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country: string;
  notes?: string;
  invoices?: Array<{
    id: string;
    invoiceNumber: string;
    total: number;
    status: string;
    issueDate: string;
  }>;
}

const EMPTY_CLIENT = {
  name: "",
  taxId: "",
  taxIdType: "NIT",
  tradeName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "GT",
  notes: "",
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState(EMPTY_CLIENT);
  const [saving, setSaving] = useState(false);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchClients = useCallback(async () => {
    try {
      const url = searchQuery
        ? `/api/clients?q=${encodeURIComponent(searchQuery)}`
        : "/api/clients";
      const res = await fetch(url);
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch {
      setError("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(fetchClients, 300);
    return () => clearTimeout(timer);
  }, [fetchClients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = editingClient
        ? `/api/clients/${editingClient.id}`
        : "/api/clients";
      const method = editingClient ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al guardar");
      }

      setShowForm(false);
      setEditingClient(null);
      setFormData(EMPTY_CLIENT);
      fetchClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      taxId: client.taxId,
      taxIdType: client.taxIdType,
      tradeName: client.tradeName || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      city: client.city || "",
      country: client.country,
      notes: client.notes || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Desactivar este cliente? Se conservará en el historial de facturas.")) return;
    try {
      await fetch(`/api/clients/${id}`, { method: "DELETE" });
      fetchClients();
    } catch {
      setError("Error al eliminar");
    }
  };

  const statusColors: Record<string, string> = {
    DRAFT: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    ISSUED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    SENT: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    PAID: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Users size={24} /> Gestión de Clientes
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {clients.length} cliente{clients.length !== 1 ? "s" : ""} registrado{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingClient(null);
            setFormData(EMPTY_CLIENT);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
            bg-[var(--color-brand-500)] text-[var(--color-dashboard-bg)]
            hover:opacity-90 transition-opacity"
        >
          <Plus size={18} /> Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre, NIT o email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
            bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)]
            text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/30
            focus:border-[var(--color-brand-500)]"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError("")}><X size={16} /></button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-[var(--color-dashboard-surface)] rounded-2xl border border-[var(--color-dashboard-border)] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-dashboard-border)]">
              <h2 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <Building2 size={20} />
                {editingClient ? "Editar Cliente" : "Nuevo Cliente"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                    Nombre / Razón Social *
                  </label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/30"
                  />
                </div>
                {/* Trade Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                    Nombre Comercial
                  </label>
                  <input
                    value={formData.tradeName}
                    onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/30"
                  />
                </div>
                {/* Tax ID Type + Tax ID */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                    Tipo ID Fiscal
                  </label>
                  <select
                    value={formData.taxIdType}
                    onChange={(e) => setFormData({ ...formData, taxIdType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/30"
                  >
                    <option value="NIT">NIT</option>
                    <option value="RUC">RUC</option>
                    <option value="CEDULA">Cédula</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="CF">Consumidor Final</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                    NIT / RUC *
                  </label>
                  <input
                    required
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder={formData.taxIdType === "CF" ? "CF" : "1234567-8"}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/30"
                  />
                </div>
                {/* Email + Phone */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                    Teléfono
                  </label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/30"
                  />
                </div>
                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                    Dirección
                  </label>
                  <input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/30"
                  />
                </div>
                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                    Notas internas
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/30 resize-none"
                  />
                </div>
              </div>
              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium
                    text-[var(--color-text-secondary)] border border-[var(--color-dashboard-border)]
                    hover:bg-[var(--color-dashboard-bg)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg text-sm font-semibold
                    bg-[var(--color-brand-500)] text-[var(--color-dashboard-bg)]
                    hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {saving ? "Guardando..." : editingClient ? "Actualizar" : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clients List */}
      {loading ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">Cargando...</div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-[var(--color-text-muted)] opacity-30 mb-3" />
          <p className="text-sm text-[var(--color-text-muted)]">
            {searchQuery ? "No se encontraron clientes" : "Aún no hay clientes registrados"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => (
            <div
              key={client.id}
              className="rounded-xl border border-[var(--color-dashboard-border)] bg-[var(--color-dashboard-surface)] overflow-hidden"
            >
              {/* Client Row */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[var(--color-brand-500)]/10 flex items-center justify-center shrink-0">
                    <Building2 size={18} className="text-[var(--color-brand-500)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                      {client.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {client.taxIdType}: {client.taxId}
                      {client.email && ` • ${client.email}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setExpandedClient(expandedClient === client.id ? null : client.id)}
                    className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-bg)] transition-colors"
                    title="Ver historial"
                  >
                    {expandedClient === client.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    onClick={() => handleEdit(client)}
                    className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-brand-500)] hover:bg-[var(--color-brand-500)]/10 transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Desactivar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Expanded: Invoice History */}
              {expandedClient === client.id && (
                <div className="border-t border-[var(--color-dashboard-border)] bg-[var(--color-dashboard-bg)] px-4 py-3">
                  {client.invoices && client.invoices.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
                        Historial de facturas
                      </p>
                      {client.invoices.map((inv) => (
                        <div key={inv.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <FileText size={14} className="text-[var(--color-text-muted)]" />
                            <span className="font-medium text-[var(--color-text-primary)]">{inv.invoiceNumber}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[inv.status] || ""}`}>
                              {inv.status}
                            </span>
                          </div>
                          <span className="font-bold text-[var(--color-text-primary)]">
                            Q {inv.total.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--color-text-muted)] text-center py-2">
                      Sin facturas registradas
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
