"use client";

import { useState, useCallback } from "react";
import useSWR, { mutate } from "swr";
import { Plus, Search, Edit2, Trash2, Users, Phone, Smartphone } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { useToast } from "@/components/ui/toast";
import { TIPOS_IDENTIFICACION } from "@/lib/billing/clave-acceso";

/* ============================================
   INTERFACES
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

interface FormErrors {
  identificacion?: string;
  razonSocial?: string;
  direccion?: string;
  telefono?: string;
  celular?: string;
  email?: string;
}

/* ============================================
   VALIDACIONES — ECUADOR
   ============================================ */

/** Solo dígitos */
function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Valida teléfono fijo Ecuador:
 * 9 dígitos: 0 + código área (1 dígito: 2,3,4,5,6,7) + 7 dígitos
 */
function validateTelefonoFijo(value: string): string | undefined {
  if (!value) return undefined; // Fijo es opcional
  const digits = onlyDigits(value);
  if (digits.length === 0) return undefined;
  if (digits.length !== 9) return "Teléfono fijo debe tener 9 dígitos (ej: 042123456)";
  if (digits[0] !== "0") return "Debe iniciar con 0 (ej: 042123456)";
  const areaCode = digits[1];
  if (!["2", "3", "4", "5", "6", "7"].includes(areaCode)) {
    return "Código de área inválido. Válidos: 02, 03, 04, 05, 06, 07";
  }
  return undefined;
}

/**
 * Valida celular Ecuador:
 * 10 dígitos: 09 + 8 dígitos
 */
function validateCelular(value: string): string | undefined {
  if (!value) return "Número de celular es obligatorio";
  const digits = onlyDigits(value);
  if (digits.length !== 10) return "Celular debe tener 10 dígitos (ej: 0991234567)";
  if (!digits.startsWith("09")) return "Celular debe iniciar con 09 (ej: 0991234567)";
  return undefined;
}

/** Valida identificación según tipo */
function validateIdentificacion(tipo: string, value: string): string | undefined {
  if (!value) return "Identificación es obligatoria";
  const digits = onlyDigits(value);
  switch (tipo) {
    case "04": // RUC
      if (digits.length !== 13) return "RUC debe tener 13 dígitos";
      break;
    case "05": // Cédula
      if (digits.length !== 10) return "Cédula debe tener 10 dígitos";
      break;
    case "06": // Pasaporte
      if (value.length < 5) return "Pasaporte debe tener mínimo 5 caracteres";
      break;
    case "07": // Consumidor Final
      if (digits !== "9999999999999") return "Consumidor Final usa 9999999999999";
      break;
  }
  return undefined;
}

function validateEmail(value: string): string | undefined {
  if (!value) return "Email es obligatorio";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return "Formato de email inválido";
  return undefined;
}

/* ============================================
   FORMATEO DE TELÉFONOS
   ============================================ */
function formatTelefonoFijo(digits: string): string {
  if (digits.length <= 2) return digits;
  if (digits.length <= 9) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  return digits.slice(0, 9);
}

function formatCelular(digits: string): string {
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  if (digits.length <= 10) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  return digits.slice(0, 10);
}

/* ============================================
   COMPONENTE
   ============================================ */
const fetcher = (url: string) => fetch(url).then((r) => r.json());

const EMPTY_FORM: FormData = {
  tipoIdentificacion: "05",
  identificacion: "",
  razonSocial: "",
  direccion: "",
  telefono: "",
  celular: "",
  email: "",
};

export default function ClientesPage() {
  const { data: customers = [] } = useSWR<Customer[]>("/api/customers", fetcher);
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormData>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setEditing(null);
    setShowForm(false);
  }, []);

  const handleEdit = (c: Customer) => {
    setForm({
      tipoIdentificacion: c.tipoIdentificacion,
      identificacion: c.identificacion,
      razonSocial: c.razonSocial,
      direccion: c.direccion || "",
      telefono: c.telefono || "",
      celular: c.celular || "",
      email: c.email || "",
    });
    setErrors({});
    setEditing(c);
    setShowForm(true);
  };

  /** Handler para campos de solo dígitos con límite */
  const handleDigitInput = (field: keyof FormData, value: string, maxLen: number) => {
    const digits = onlyDigits(value);
    if (digits.length <= maxLen) {
      setForm((f) => ({ ...f, [field]: digits }));
      // Limpiar error al escribir
      if (errors[field as keyof FormErrors]) {
        setErrors((e) => ({ ...e, [field]: undefined }));
      }
    }
  };

  /** Validación completa del formulario */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const idErr = validateIdentificacion(form.tipoIdentificacion, form.identificacion);
    if (idErr) newErrors.identificacion = idErr;

    if (!form.razonSocial.trim()) newErrors.razonSocial = "Razón social es obligatoria";
    if (!form.direccion.trim()) newErrors.direccion = "Dirección es obligatoria";

    const telErr = validateTelefonoFijo(form.telefono);
    if (telErr) newErrors.telefono = telErr;

    const celErr = validateCelular(form.celular);
    if (celErr) newErrors.celular = celErr;

    const emailErr = validateEmail(form.email);
    if (emailErr) newErrors.email = emailErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      addToast({ message: "Corrija los errores en el formulario", variant: "error" });
      return;
    }

    setSubmitting(true);
    const method = editing ? "PUT" : "POST";
    const body = editing ? { id: editing.id, ...form } : form;

    try {
      const res = await fetch("/api/customers", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }
      addToast({
        message: editing ? "Cliente actualizado exitosamente" : "Cliente creado exitosamente",
        variant: "success",
      });
      resetForm();
      mutate("/api/customers");
    } catch (err) {
      addToast({ message: err instanceof Error ? err.message : "Error", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este cliente?")) return;
    try {
      const res = await fetch("/api/customers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Error");
      addToast({ message: "Cliente eliminado", variant: "success" });
      mutate("/api/customers");
    } catch {
      addToast({ message: "Error al eliminar cliente", variant: "error" });
    }
  };

  const filtered = (customers || []).filter(
    (c: Customer) =>
      c.razonSocial?.toLowerCase().includes(search.toLowerCase()) ||
      c.identificacion?.includes(search) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  /* ---- COLUMNAS DE TABLA ---- */
  const columns: Column<Customer>[] = [
    {
      key: "tipo",
      header: "Tipo ID",
      sortValue: (c) => c.tipoIdentificacion,
      render: (c) => (
        <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-brand-500)]/10 text-[var(--color-brand-500)] whitespace-nowrap">
          {TIPOS_IDENTIFICACION[c.tipoIdentificacion] || c.tipoIdentificacion}
        </span>
      ),
    },
    {
      key: "id",
      header: "Identificación",
      sortValue: (c) => c.identificacion,
      render: (c) => <span className="font-mono text-sm">{c.identificacion}</span>,
    },
    {
      key: "name",
      header: "Razón Social",
      sortValue: (c) => c.razonSocial,
      render: (c) => <span className="font-medium text-[var(--color-text-primary)]">{c.razonSocial}</span>,
    },
    {
      key: "email",
      header: "Email",
      render: (c) => <span className="text-[var(--color-text-muted)] text-sm">{c.email || "—"}</span>,
    },
    {
      key: "celular",
      header: "Celular",
      render: (c) => (
        <span className="text-[var(--color-text-muted)] text-sm font-mono">
          {c.celular ? formatCelular(c.celular) : "—"}
        </span>
      ),
    },
    {
      key: "telefono",
      header: "Telf. Fijo",
      render: (c) => (
        <span className="text-[var(--color-text-muted)] text-sm font-mono">
          {c.telefono ? formatTelefonoFijo(c.telefono) : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      sortable: false,
      render: (c) => (
        <div className="flex gap-1">
          <button
            onClick={() => handleEdit(c)}
            className="p-1.5 rounded hover:bg-[var(--color-brand-500)]/10 text-[var(--color-brand-500)]"
            title="Editar"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDelete(c.id)}
            className="p-1.5 rounded hover:bg-red-500/10 text-red-500"
            title="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  /* ---- ESTILOS ---- */
  const inputCls =
    "w-full px-3 py-2.5 rounded-lg bg-[var(--color-dashboard-input)] border border-[var(--color-dashboard-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] placeholder:text-[var(--color-text-muted)]/40";
  const inputErrorCls =
    "w-full px-3 py-2.5 rounded-lg bg-[var(--color-dashboard-input)] border border-red-500 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-[var(--color-text-muted)]/40";
  const labelCls = "block text-xs font-medium text-[var(--color-text-muted)] mb-1.5";
  const errorCls = "text-xs text-red-500 mt-1";

  /* ---- Maxlength para identificación según tipo ---- */
  const idMaxLength = form.tipoIdentificacion === "04" ? 13 : form.tipoIdentificacion === "05" ? 10 : 20;
  const idPlaceholder =
    form.tipoIdentificacion === "04"
      ? "Ej: 0991234567001"
      : form.tipoIdentificacion === "05"
        ? "Ej: 0912345678"
        : form.tipoIdentificacion === "06"
          ? "Ej: AB1234567"
          : "9999999999999";

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Users size={24} /> Gestión de Clientes
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {filtered.length} cliente{filtered.length !== 1 ? "s" : ""} registrado{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-brand-500)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Nuevo Cliente
        </button>
      </div>

      {/* FORMULARIO */}
      {showForm && (
        <form
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="rounded-xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] p-6"
        >
          <h2 className="font-semibold text-[var(--color-text-primary)] mb-5 text-lg">
            {editing ? "Editar Cliente" : "Registrar Nuevo Cliente"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-4">
            {/* Tipo de Identificación */}
            <div>
              <label className={labelCls}>Tipo de Identificación *</label>
              <select
                value={form.tipoIdentificacion}
                onChange={(e) => {
                  setForm((f) => ({ ...f, tipoIdentificacion: e.target.value, identificacion: "" }));
                  setErrors((e2) => ({ ...e2, identificacion: undefined }));
                }}
                className={inputCls}
                autoComplete="off"
              >
                {Object.entries(TIPOS_IDENTIFICACION).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* Identificación */}
            <div>
              <label className={labelCls}>Identificación *</label>
              <input
                value={form.identificacion}
                onChange={(e) => {
                  const val = form.tipoIdentificacion === "06" ? e.target.value : onlyDigits(e.target.value);
                  if (val.length <= idMaxLength) {
                    setForm((f) => ({ ...f, identificacion: val }));
                    if (errors.identificacion) setErrors((e2) => ({ ...e2, identificacion: undefined }));
                  }
                }}
                placeholder={idPlaceholder}
                maxLength={idMaxLength}
                className={errors.identificacion ? inputErrorCls : inputCls}
                autoComplete="nope"
                inputMode={form.tipoIdentificacion === "06" ? "text" : "numeric"}
                name="customer-id-field"
                id="customer-id-field"
              />
              {errors.identificacion && <p className={errorCls}>{errors.identificacion}</p>}
            </div>

            {/* Razón Social */}
            <div>
              <label className={labelCls}>Razón Social / Nombre *</label>
              <input
                value={form.razonSocial}
                onChange={(e) => {
                  setForm((f) => ({ ...f, razonSocial: e.target.value }));
                  if (errors.razonSocial) setErrors((er) => ({ ...er, razonSocial: undefined }));
                }}
                placeholder="Nombre completo o razón social"
                className={errors.razonSocial ? inputErrorCls : inputCls}
                autoComplete="nope"
                name="customer-name-field"
                id="customer-name-field"
              />
              {errors.razonSocial && <p className={errorCls}>{errors.razonSocial}</p>}
            </div>

            {/* Dirección */}
            <div className="md:col-span-2 xl:col-span-1">
              <label className={labelCls}>Dirección *</label>
              <input
                value={form.direccion}
                onChange={(e) => {
                  setForm((f) => ({ ...f, direccion: e.target.value }));
                  if (errors.direccion) setErrors((er) => ({ ...er, direccion: undefined }));
                }}
                placeholder="Av. Principal y Calle Secundaria, Ciudad"
                className={errors.direccion ? inputErrorCls : inputCls}
                autoComplete="nope"
                name="customer-address-field"
                id="customer-address-field"
              />
              {errors.direccion && <p className={errorCls}>{errors.direccion}</p>}
            </div>

            {/* Celular */}
            <div>
              <label className={labelCls}>
                <span className="flex items-center gap-1">
                  <Smartphone size={12} /> Celular *
                </span>
              </label>
              <input
                value={formatCelular(form.celular)}
                onChange={(e) => handleDigitInput("celular", e.target.value, 10)}
                placeholder="0991 234 567"
                className={errors.celular ? inputErrorCls : inputCls}
                autoComplete="nope"
                inputMode="numeric"
                name="customer-mobile-field"
                id="customer-mobile-field"
              />
              {errors.celular && <p className={errorCls}>{errors.celular}</p>}
              {!errors.celular && (
                <p className="text-xs text-[var(--color-text-muted)]/60 mt-1">10 dígitos, inicia con 09</p>
              )}
            </div>

            {/* Teléfono Fijo (opcional) */}
            <div>
              <label className={labelCls}>
                <span className="flex items-center gap-1">
                  <Phone size={12} /> Teléfono Fijo
                </span>
              </label>
              <input
                value={formatTelefonoFijo(form.telefono)}
                onChange={(e) => handleDigitInput("telefono", e.target.value, 9)}
                placeholder="04 2123456"
                className={errors.telefono ? inputErrorCls : inputCls}
                autoComplete="nope"
                inputMode="numeric"
                name="customer-phone-field"
                id="customer-phone-field"
              />
              {errors.telefono && <p className={errorCls}>{errors.telefono}</p>}
              {!errors.telefono && (
                <p className="text-xs text-[var(--color-text-muted)]/60 mt-1">9 dígitos, ej: 02, 04, 07 (opcional)</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className={labelCls}>Email *</label>
              <input
                value={form.email}
                onChange={(e) => {
                  setForm((f) => ({ ...f, email: e.target.value }));
                  if (errors.email) setErrors((er) => ({ ...er, email: undefined }));
                }}
                placeholder="correo@ejemplo.com"
                type="text"
                className={errors.email ? inputErrorCls : inputCls}
                autoComplete="nope"
                name="customer-email-field"
                id="customer-email-field"
              />
              {errors.email && <p className={errorCls}>{errors.email}</p>}
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-[var(--color-dashboard-border)]">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--color-brand-500)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {submitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Guardando...
                </>
              ) : editing ? (
                "Actualizar Cliente"
              ) : (
                "Guardar Cliente"
              )}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2.5 rounded-lg border border-[var(--color-dashboard-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-dashboard-surface-hover)] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* BÚSQUEDA */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, identificación o email..."
          className={`${inputCls} pl-9 max-w-md`}
          autoComplete="off"
        />
      </div>

      {/* TABLA — Desktop */}
      <div className="hidden md:block">
        <DataTable columns={columns} data={filtered} emptyMessage="No hay clientes registrados" caption="Lista de clientes" />
      </div>

      {/* CARDS — Mobile */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)] py-8">No hay clientes registrados</p>
        ) : (
          filtered.map((c) => (
            <div
              key={c.id}
              className="rounded-xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-brand-500)]/10 text-[var(--color-brand-500)]">
                    {TIPOS_IDENTIFICACION[c.tipoIdentificacion]}
                  </span>
                  <span className="ml-2 font-mono text-sm text-[var(--color-text-muted)]">{c.identificacion}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(c)} className="p-1.5 rounded hover:bg-[var(--color-brand-500)]/10 text-[var(--color-brand-500)]">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded hover:bg-red-500/10 text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="font-medium text-[var(--color-text-primary)]">{c.razonSocial}</p>
              <div className="mt-2 space-y-1 text-xs text-[var(--color-text-muted)]">
                {c.celular && (
                  <p className="flex items-center gap-1">
                    <Smartphone size={11} /> {formatCelular(c.celular)}
                  </p>
                )}
                {c.telefono && (
                  <p className="flex items-center gap-1">
                    <Phone size={11} /> {formatTelefonoFijo(c.telefono)}
                  </p>
                )}
                {c.email && <p>{c.email}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
