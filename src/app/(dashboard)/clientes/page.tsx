"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Users, Phone, Smartphone } from "lucide-react";
import { PageHeader, Card, ErrorState } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/data-table";
import { useToast } from "@/components/ui/toast";
import { FullScreenLoader } from "@/components/ui/fullscreen-loader";
import { useUnsavedGuard } from "@/components/ui/unsaved-guard";
import { CriticalActionDialog } from "@/components/ui/critical-action-dialog";
import { useData, invalidateCache } from "@/lib/hooks/use-data";
import { TIPOS_IDENTIFICACION } from "@/lib/billing/clave-acceso";

/* ============================================
   TYPES
   ============================================ */
interface Customer {
  id: string;
  tipoIdentificacion: string;
  identificacion: string;
  razonSocial: string;
  direccion: string;
  telefono?: string;
  celular: string;
  email: string;
}

interface FormData {
  tipoIdentificacion: string;
  identificacion: string;
  razonSocial: string;
  direccion: string;
  telefono: string;
  celular: string;
  email: string;
}

interface FormErrors { [key: string]: string | undefined; }

/* ============================================
   ECUADOR PHONE & ID VALIDATION
   ============================================ */
function onlyDigits(v: string): string { return v.replace(/\D/g, ""); }

function validateFijo(v: string): string | undefined {
  if (!v) return undefined;
  const d = onlyDigits(v);
  if (!d) return undefined;
  if (d.length !== 9) return "Fijo: 9 dígitos (ej: 042123456)";
  if (d[0] !== "0") return "Debe iniciar con 0";
  if (!["2","3","4","5","6","7"].includes(d[1])) return "Código área inválido (02-07)";
  return undefined;
}

function validateCelular(v: string): string | undefined {
  if (!v) return "Celular es obligatorio";
  const d = onlyDigits(v);
  if (d.length !== 10) return "Celular: 10 dígitos (ej: 0991234567)";
  if (!d.startsWith("09")) return "Debe iniciar con 09";
  return undefined;
}

function validateId(tipo: string, v: string): string | undefined {
  if (!v) return "Identificación es obligatoria";
  const d = onlyDigits(v);
  if (tipo === "04" && d.length !== 13) return "RUC: 13 dígitos";
  if (tipo === "05" && d.length !== 10) return "Cédula: 10 dígitos";
  if (tipo === "06" && v.length < 5) return "Pasaporte: mín. 5 caracteres";
  return undefined;
}

function validateEmail(v: string): string | undefined {
  if (!v) return "Email es obligatorio";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Email inválido";
  return undefined;
}

function fmtFijo(d: string): string {
  const clean = onlyDigits(d);
  if (clean.length <= 2) return clean;
  return `${clean.slice(0,2)} ${clean.slice(2,9)}`;
}

function fmtCel(d: string): string {
  const clean = onlyDigits(d);
  if (clean.length <= 4) return clean;
  if (clean.length <= 7) return `${clean.slice(0,4)} ${clean.slice(4)}`;
  return `${clean.slice(0,4)} ${clean.slice(4,7)} ${clean.slice(7,10)}`;
}

const EMPTY_FORM: FormData = {
  tipoIdentificacion: "05", identificacion: "", razonSocial: "",
  direccion: "", telefono: "", celular: "", email: "",
};

/* ============================================
   PAGE COMPONENT
   ============================================ */
export default function ClientesPage() {
  const { data: rawData, isLoading, error, mutate } = useData<Customer[]>("/api/customers");
  const { addToast } = useToast();
  const { setDirty, clearDirty } = useUnsavedGuard();

  const customers: Customer[] = Array.isArray(rawData) ? rawData : [];

  const [showForm, setShowForm] = useState(false);

  // Track unsaved changes
  useEffect(() => {
    if (showForm) setDirty();
    else clearDirty();
  }, [showForm, setDirty, clearDirty]);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormData>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const resetForm = useCallback(() => {
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setEditing(null);
    setShowForm(false);
  }, []);

  const handleEdit = (c: Customer) => {
    setForm({
      tipoIdentificacion: c.tipoIdentificacion || "05",
      identificacion: c.identificacion || "",
      razonSocial: c.razonSocial || "",
      direccion: c.direccion || "",
      telefono: c.telefono || "",
      celular: c.celular || "",
      email: c.email || "",
    });
    setErrors({});
    setEditing(c);
    setShowForm(true);
  };

  const setDigit = (field: keyof FormData, value: string, max: number) => {
    const d = onlyDigits(value);
    if (d.length <= max) {
      setForm(f => ({ ...f, [field]: d }));
      if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    const r1 = validateId(form.tipoIdentificacion, form.identificacion); if (r1) e.identificacion = r1;
    if (!form.razonSocial.trim()) e.razonSocial = "Razón social obligatoria";
    if (!form.direccion.trim()) e.direccion = "Dirección obligatoria";
    const r2 = validateFijo(form.telefono); if (r2) e.telefono = r2;
    const r3 = validateCelular(form.celular); if (r3) e.celular = r3;
    const r4 = validateEmail(form.email); if (r4) e.email = r4;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      addToast({ message: "Corrija los errores del formulario", variant: "error" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/customers", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { id: editing.id, ...form } : form),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Error al guardar");
      }
      addToast({ message: editing ? "Cliente actualizado" : "Cliente creado", variant: "success" });
      resetForm();
      invalidateCache("/api/customers");
      mutate();
    } catch (err) {
      addToast({ message: err instanceof Error ? err.message : "Error", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Find the customer to show in dialog
    const customer = customers.find(c => c.id === id);
    if (customer) setDeleteTarget(customer);
  };

  const executeDelete = async (reason: string, operator: string) => {
    if (!deleteTarget) return;
    try {
      await fetch("/api/customers", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleteTarget.id }) });
      addToast({ message: "Cliente eliminado", variant: "success" });
      invalidateCache("/api/customers");
      mutate();
    } catch {
      addToast({ message: "Error al eliminar", variant: "error" });
    }
    setDeleteTarget(null);
  };

  const filtered = customers.filter(c =>
    (c.razonSocial || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.identificacion || "").includes(search) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase())
  );

  /* ---- TABLE COLUMNS ---- */
  const columns: Column<Customer>[] = [
    {
      key: "tipo", header: "Tipo",
      sortValue: c => c.tipoIdentificacion,
      render: c => <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-brand-500)]/10 text-[var(--color-brand-500)] whitespace-nowrap">{TIPOS_IDENTIFICACION[c.tipoIdentificacion] || c.tipoIdentificacion}</span>,
    },
    { key: "id_num", header: "Identificación", sortValue: c => c.identificacion, render: c => <span className="font-mono text-sm">{c.identificacion}</span> },
    { key: "name", header: "Razón Social", sortValue: c => c.razonSocial, render: c => <span className="font-medium text-[var(--color-text-primary)]">{c.razonSocial}</span> },
    { key: "email", header: "Email", render: c => <span className="text-[var(--color-text-muted)] text-sm break-all">{c.email || "—"}</span> },
    { key: "cel", header: "Celular", render: c => <span className="text-[var(--color-text-muted)] text-sm font-mono">{c.celular ? fmtCel(c.celular) : "—"}</span> },
    {
      key: "actions", header: "Acciones", sortable: false,
      render: c => (
        <div className="flex gap-1">
          <button onClick={() => handleEdit(c)} className="p-1.5 rounded hover:bg-[var(--color-brand-500)]/10 text-[var(--color-brand-500)]" title="Editar cliente"><Edit2 size={14} /></button>
          <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded hover:bg-red-500/10 text-red-500" title="Eliminar cliente"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  /* ---- STYLES ---- */
  const inp = "w-full px-3 py-2.5 rounded-lg bg-[var(--color-dashboard-input)] border border-[var(--color-dashboard-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] placeholder:text-[var(--color-text-muted)]/70";
  const inpErr = inp.replace("border-[var(--color-dashboard-border)]", "border-red-500").replace("focus:ring-[var(--color-brand-500)]", "focus:ring-red-500");
  const lbl = "block text-xs font-medium text-[var(--color-text-muted)] mb-1.5";
  const errMsg = "text-xs text-red-500 mt-1";
  const idMax = form.tipoIdentificacion === "04" ? 13 : form.tipoIdentificacion === "05" ? 10 : 20;

  /* ---- LOADING / ERROR ---- */
  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-brand-500)] border-t-transparent" /></div>;
  if (error) return <ErrorState message={error} onRetry={mutate} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Clientes"
        description={`${filtered.length} cliente${filtered.length !== 1 ? "s" : ""} registrado${filtered.length !== 1 ? "s" : ""}`}
        actions={
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-brand-500)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus size={16} /> Nuevo Cliente
          </button>
        }
      />

      {/* FORM */}
      {showForm && (
        <Card>
          <form autoComplete="off" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
            <h2 className="font-semibold text-[var(--color-text-primary)] mb-5 text-lg">{editing ? "Editar Cliente" : "Registrar Nuevo Cliente"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-4">
              {/* Tipo ID */}
              <div>
                <label className={lbl}>Tipo de Identificación *</label>
                <select value={form.tipoIdentificacion} onChange={e => { setForm(f => ({ ...f, tipoIdentificacion: e.target.value, identificacion: "" })); setErrors(er => ({ ...er, identificacion: undefined })); }} className={inp} autoComplete="off">
                  {Object.entries(TIPOS_IDENTIFICACION).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              {/* Identificación */}
              <div>
                <label className={lbl}>Identificación *</label>
                <input value={form.identificacion} onChange={e => { const val = form.tipoIdentificacion === "06" ? e.target.value : onlyDigits(e.target.value); if (val.length <= idMax) { setForm(f => ({ ...f, identificacion: val })); if (errors.identificacion) setErrors(er => ({ ...er, identificacion: undefined })); }}} maxLength={idMax} className={errors.identificacion ? inpErr : inp} autoComplete="nope" inputMode={form.tipoIdentificacion === "06" ? "text" : "numeric"} name="cid_x1" id="cid_x1" placeholder={form.tipoIdentificacion === "04" ? "0991234567001" : form.tipoIdentificacion === "05" ? "0912345678" : "Identificación"} />
                {errors.identificacion && <p className={errMsg}>{errors.identificacion}</p>}
              </div>
              {/* Razón Social */}
              <div>
                <label className={lbl}>Razón Social / Nombre *</label>
                <input value={form.razonSocial} onChange={e => { setForm(f => ({ ...f, razonSocial: e.target.value })); if (errors.razonSocial) setErrors(er => ({ ...er, razonSocial: undefined })); }} className={errors.razonSocial ? inpErr : inp} autoComplete="nope" name="crs_x1" id="crs_x1" placeholder="Nombre completo o razón social" />
                {errors.razonSocial && <p className={errMsg}>{errors.razonSocial}</p>}
              </div>
              {/* Dirección */}
              <div className="md:col-span-2 xl:col-span-1">
                <label className={lbl}>Dirección *</label>
                <input value={form.direccion} onChange={e => { setForm(f => ({ ...f, direccion: e.target.value })); if (errors.direccion) setErrors(er => ({ ...er, direccion: undefined })); }} className={errors.direccion ? inpErr : inp} autoComplete="nope" name="cdr_x1" id="cdr_x1" placeholder="Av. Principal y Calle, Ciudad" />
                {errors.direccion && <p className={errMsg}>{errors.direccion}</p>}
              </div>
              {/* Celular */}
              <div>
                <label className={lbl}><span className="flex items-center gap-1"><Smartphone size={12} /> Celular *</span></label>
                <input value={fmtCel(form.celular)} onChange={e => setDigit("celular", e.target.value, 10)} className={errors.celular ? inpErr : inp} autoComplete="nope" inputMode="numeric" name="ccl_x1" id="ccl_x1" placeholder="Ej: 0990 000 000" />
                {errors.celular ? <p className={errMsg}>{errors.celular}</p> : <p className="text-xs text-[var(--color-text-muted)]/50 mt-1">10 dígitos, inicia con 09</p>}
              </div>
              {/* Fijo */}
              <div>
                <label className={lbl}><span className="flex items-center gap-1"><Phone size={12} /> Teléfono Fijo</span></label>
                <input value={fmtFijo(form.telefono)} onChange={e => setDigit("telefono", e.target.value, 9)} className={errors.telefono ? inpErr : inp} autoComplete="nope" inputMode="numeric" name="ctf_x1" id="ctf_x1" placeholder="Ej: 04 2000000" />
                {errors.telefono ? <p className={errMsg}>{errors.telefono}</p> : <p className="text-xs text-[var(--color-text-muted)]/50 mt-1">Opcional, 9 dígitos</p>}
              </div>
              {/* Email */}
              <div>
                <label className={lbl}>Email *</label>
                <input value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); if (errors.email) setErrors(er => ({ ...er, email: undefined })); }} className={errors.email ? inpErr : inp} autoComplete="nope" name="cem_x1" id="cem_x1" placeholder="correo@ejemplo.com" />
                {errors.email && <p className={errMsg}>{errors.email}</p>}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-[var(--color-dashboard-border)]">
              <button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
                {submitting ? <><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Guardando...</> : editing ? "Actualizar" : "Guardar Cliente"}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors">Cancelar</button>
            </div>
          </form>
        </Card>
      )}

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, ID o email..." className={`${inp} pl-9`} autoComplete="off" />
      </div>

      {/* TABLE — Desktop */}
      <div className="hidden md:block">
        <Card padding={false}>
          <DataTable columns={columns} data={filtered} emptyMessage="No hay clientes registrados" caption="Lista de clientes" />
        </Card>
      </div>

      {/* CARDS — Mobile */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <Card><p className="text-center text-[var(--color-text-muted)] py-4">No hay clientes registrados</p></Card>
        ) : filtered.map(c => (
          <Card key={c.id}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-brand-500)]/10 text-[var(--color-brand-500)]">{TIPOS_IDENTIFICACION[c.tipoIdentificacion]}</span>
                <span className="ml-2 font-mono text-sm text-[var(--color-text-muted)]">{c.identificacion}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(c)} className="p-1.5 rounded hover:bg-[var(--color-brand-500)]/10 text-[var(--color-brand-500)]" title="Editar cliente"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded hover:bg-red-500/10 text-red-500" title="Eliminar cliente"><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="font-medium text-[var(--color-text-primary)]">{c.razonSocial}</p>
            <div className="mt-2 space-y-1 text-xs text-[var(--color-text-muted)]">
              {c.celular && <p className="flex items-center gap-1"><Smartphone size={11} /> {fmtCel(c.celular)}</p>}
              {c.telefono && <p className="flex items-center gap-1"><Phone size={11} /> {fmtFijo(c.telefono)}</p>}
              {c.email && <p>{c.email}</p>}
            </div>
          </Card>
        ))}
      </div>

      {/* Critical Action Dialog for delete */}
      <CriticalActionDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
        title={`Eliminar cliente: ${deleteTarget?.razonSocial || ""}`}
        description={`Esta acción eliminará al cliente "${deleteTarget?.razonSocial || ""}" (${deleteTarget?.identificacion || ""}). Esta operación queda registrada en el historial de auditoría.`}
        actionLabel="Eliminar cliente"
        actionType="ELIMINAR_CLIENTE"
        targetType="Cliente"
        targetId={deleteTarget?.id || ""}
        targetName={deleteTarget?.razonSocial || ""}
      />
    </div>
  );
}
