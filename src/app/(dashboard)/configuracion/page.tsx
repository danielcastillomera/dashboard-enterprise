"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Settings, Building2, MapPin, Phone, Palette, FileText,
  Globe, Mail, ChevronRight, ArrowLeft, Save, X,
  Upload, Trash2, Image as ImageIcon, CheckCircle2,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

/* ============================================
   TYPES
   ============================================ */
interface BusinessProfile {
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  direccionMatriz: string;
  direccionSucursal: string;
  telefono: string;
  email: string;
  website: string;
  logoUrl: string;
  ambiente: string;
  obligadoContabilidad: boolean;
  contribuyenteEspecial: string;
  regimenRimpe: boolean;
  ivaRate: number;
  establishment: string;
  emissionPoint: string;
  // Regional preferences (stored in a separate object but displayed together)
  language: string;
  timezone: string;
  currency: string;
  dateFormat: string;
}

type SectionKey =
  | "perfil"
  | "sucursales"
  | "contacto"
  | "visual"
  | "facturacion"
  | "regional"
  | "notificaciones";

interface FieldError { [key: string]: string }

/* ============================================
   SECTION CONFIG
   ============================================ */
const SECTIONS: { key: SectionKey; icon: React.ReactNode; name: string; description: string }[] = [
  { key: "perfil",         icon: <Building2 size={22} />, name: "Perfil Empresarial",        description: "Datos tributarios, RUC, razón social" },
  { key: "sucursales",     icon: <MapPin size={22} />,    name: "Sucursales y Direcciones",  description: "Dirección matriz y sucursales" },
  { key: "contacto",       icon: <Phone size={22} />,     name: "Contacto y Redes",          description: "Teléfono, email, website" },
  { key: "visual",         icon: <Palette size={22} />,   name: "Identidad Visual",          description: "Logo, colores de marca" },
  { key: "facturacion",    icon: <FileText size={22} />,  name: "Facturación Electrónica",   description: "Ambiente SRI, establecimiento, punto emisión" },
  { key: "regional",       icon: <Globe size={22} />,     name: "Preferencias Regionales",   description: "Idioma, zona horaria, moneda, formato fecha" },
  { key: "notificaciones", icon: <Mail size={22} />,      name: "Notificaciones por Email",  description: "Configuración de envío de correos" },
];

const TIMEZONES = [
  "America/Guayaquil",
  "America/Bogota",
  "America/Lima",
  "America/Caracas",
  "America/Santiago",
  "America/Buenos_Aires",
  "America/Sao_Paulo",
  "America/Mexico_City",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/Madrid",
  "UTC",
];

const CURRENCIES = ["USD", "EUR", "COP", "PEN", "BRL", "MXN", "ARS", "CLP"];
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const LANGUAGES = [{ value: "es", label: "Español" }, { value: "en", label: "English" }];

const DEFAULT_FORM: BusinessProfile = {
  ruc: "", razonSocial: "", nombreComercial: "",
  direccionMatriz: "", direccionSucursal: "",
  telefono: "", email: "", website: "", logoUrl: "",
  ambiente: "PRUEBAS", obligadoContabilidad: false,
  contribuyenteEspecial: "", regimenRimpe: false,
  ivaRate: 15, establishment: "001", emissionPoint: "001",
  language: "es", timezone: "America/Guayaquil",
  currency: "USD", dateFormat: "DD/MM/YYYY",
};

/* ============================================
   STYLES
   ============================================ */
const inputCls = "w-full px-3 py-2.5 rounded-lg bg-[var(--color-dashboard-input)] border border-[var(--color-dashboard-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] transition-colors";
const inputErrCls = "w-full px-3 py-2.5 rounded-lg bg-[var(--color-dashboard-input)] border border-red-500 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors";
const labelCls = "block text-xs font-medium text-[var(--color-text-muted)] mb-1";
const sectionCls = "rounded-xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] p-5";

function FieldErr({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

/* ============================================
   LOGO UPLOADER
   ============================================ */
function LogoUploader({ logoUrl, onUpload, onDelete }: { logoUrl: string; onUpload: (url: string) => void; onDelete: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { addToast } = useToast();

  const handleFile = useCallback(async (file: File) => {
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
    if (!allowed.includes(file.type)) {
      addToast({ message: "Formato no permitido. Use PNG, JPG, SVG o WebP.", variant: "error" });
      return;
    }
    if (file.size < 10 * 1024 && file.type !== "image/svg+xml") {
      addToast({ message: "El archivo es demasiado pequeño (mínimo 10 KB).", variant: "error" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      addToast({ message: "El archivo excede el límite de 2 MB.", variant: "error" });
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-logo", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al subir");
      onUpload(json.url);
      addToast({ message: "Logo subido exitosamente", variant: "success" });
    } catch (err) {
      addToast({ message: err instanceof Error ? err.message : "Error al subir logo", variant: "error" });
    } finally {
      setUploading(false);
    }
  }, [addToast, onUpload]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onPaste = useCallback((e: React.ClipboardEvent) => {
    const file = e.clipboardData.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="space-y-3">
      {logoUrl ? (
        <div className="flex items-start gap-4">
          <img src={logoUrl} alt="Logo de empresa" className="w-24 h-24 object-contain rounded-xl border border-[var(--color-dashboard-border)] bg-white p-1" />
          <div className="flex flex-col gap-2 mt-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-dashboard-border)] text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)] transition-colors"
            >
              <Upload size={13} /> Reemplazar
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={13} /> Eliminar
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onPaste={onPaste}
          onClick={() => inputRef.current?.click()}
          tabIndex={0}
          aria-label="Subir logo de empresa"
          className={`flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)] ${
            dragging
              ? "border-[var(--color-brand-500)] bg-[var(--color-brand-500)]/5"
              : "border-[var(--color-dashboard-border)] hover:border-[var(--color-brand-500)] hover:bg-[var(--color-brand-500)]/5"
          }`}
        >
          {uploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[var(--color-brand-500)] border-t-transparent" />
          ) : (
            <>
              <ImageIcon size={28} className="text-[var(--color-text-muted)] mb-2" />
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Clic, arrastra o pega imagen aquí</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">PNG, JPG, SVG, WebP · Mín. 10 KB · Máx. 2 MB</p>
              <p className="text-xs text-[var(--color-text-muted)]">Recomendado: 500×500 px · Mínimo: 100×100 px</p>
            </>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />
    </div>
  );
}

/* ============================================
   SECTION RENDERERS
   ============================================ */
function SectionPerfil({ form, errors, set }: { form: BusinessProfile; errors: FieldError; set: (k: keyof BusinessProfile, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>R.U.C. *</label>
          <input value={form.ruc} onChange={e => { const v = e.target.value.replace(/\D/g, ""); if (v.length <= 13) set("ruc", v); }} onBlur={() => set("ruc", form.ruc.trim())} placeholder="Ej: 0990000000001" maxLength={13} inputMode="numeric" className={errors.ruc ? inputErrCls : inputCls} />
          <FieldErr msg={errors.ruc} />
        </div>
        <div>
          <label className={labelCls}>Razón Social *</label>
          <input value={form.razonSocial} onChange={e => set("razonSocial", e.target.value)} placeholder="EMPRESA S.A." className={errors.razonSocial ? inputErrCls : inputCls} />
          <FieldErr msg={errors.razonSocial} />
        </div>
        <div>
          <label className={labelCls}>Nombre Comercial</label>
          <input value={form.nombreComercial} onChange={e => set("nombreComercial", e.target.value)} placeholder="Mi Empresa" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Contribuyente Especial No.</label>
          <input value={form.contribuyenteEspecial} onChange={e => set("contribuyenteEspecial", e.target.value)} placeholder="Ej: 00000" className={inputCls} />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.obligadoContabilidad} onChange={e => set("obligadoContabilidad", e.target.checked)} className="rounded accent-[var(--color-brand-500)]" />
          <span className="text-sm text-[var(--color-text-primary)]">Obligado a llevar contabilidad</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.regimenRimpe} onChange={e => set("regimenRimpe", e.target.checked)} className="rounded accent-[var(--color-brand-500)]" />
          <span className="text-sm text-[var(--color-text-primary)]">Régimen RIMPE</span>
        </label>
      </div>
    </div>
  );
}

function SectionSucursales({ form, errors, set }: { form: BusinessProfile; errors: FieldError; set: (k: keyof BusinessProfile, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Dirección Matriz *</label>
        <input value={form.direccionMatriz} onChange={e => set("direccionMatriz", e.target.value)} placeholder="Av. Principal y Calle Secundaria, Edificio" className={errors.direccionMatriz ? inputErrCls : inputCls} />
        <FieldErr msg={errors.direccionMatriz} />
      </div>
      <div>
        <label className={labelCls}>Dirección Sucursal</label>
        <input value={form.direccionSucursal} onChange={e => set("direccionSucursal", e.target.value)} placeholder="Dirección de la sucursal (opcional)" className={inputCls} />
      </div>
    </div>
  );
}

function SectionContacto({ form, errors, set }: { form: BusinessProfile; errors: FieldError; set: (k: keyof BusinessProfile, v: unknown) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label className={labelCls}>Teléfono</label>
        <input value={form.telefono} onChange={e => { const v = e.target.value.replace(/\D/g, ""); if (v.length <= 15) set("telefono", v); }} inputMode="numeric" placeholder="Ej: 042000000" className={errors.telefono ? inputErrCls : inputCls} />
        <FieldErr msg={errors.telefono} />
      </div>
      <div>
        <label className={labelCls}>Email</label>
        <input value={form.email} onChange={e => set("email", e.target.value)} type="email" placeholder="info@empresa.com" className={errors.email ? inputErrCls : inputCls} />
        <FieldErr msg={errors.email} />
      </div>
      <div>
        <label className={labelCls}>Sitio Web</label>
        <input value={form.website} onChange={e => set("website", e.target.value)} placeholder="www.empresa.com" className={inputCls} />
      </div>
    </div>
  );
}

function SectionVisual({ form, set }: { form: BusinessProfile; set: (k: keyof BusinessProfile, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Logo de la Empresa</label>
        <LogoUploader
          logoUrl={form.logoUrl}
          onUpload={url => set("logoUrl", url)}
          onDelete={() => set("logoUrl", "")}
        />
      </div>
    </div>
  );
}

function SectionFacturacion({ form, errors, set }: { form: BusinessProfile; errors: FieldError; set: (k: keyof BusinessProfile, v: unknown) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <div className="sm:col-span-2 md:col-span-1">
        <label className={labelCls}>Ambiente SRI</label>
        <select value={form.ambiente} onChange={e => set("ambiente", e.target.value)} className={inputCls}>
          <option value="PRUEBAS">PRUEBAS</option>
          <option value="PRODUCCION">PRODUCCIÓN</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Establecimiento *</label>
        <input value={form.establishment} onChange={e => { const v = e.target.value.replace(/\D/g, ""); if (v.length <= 3) set("establishment", v); }} maxLength={3} inputMode="numeric" placeholder="001" className={errors.establishment ? inputErrCls : inputCls} />
        <FieldErr msg={errors.establishment} />
      </div>
      <div>
        <label className={labelCls}>Punto de Emisión *</label>
        <input value={form.emissionPoint} onChange={e => { const v = e.target.value.replace(/\D/g, ""); if (v.length <= 3) set("emissionPoint", v); }} maxLength={3} inputMode="numeric" placeholder="001" className={errors.emissionPoint ? inputErrCls : inputCls} />
        <FieldErr msg={errors.emissionPoint} />
      </div>
      <div>
        <label className={labelCls}>Tarifa IVA (%)</label>
        <input type="number" value={form.ivaRate} min={0} max={100} onChange={e => set("ivaRate", Number(e.target.value))} className={inputCls} />
      </div>
    </div>
  );
}

function SectionRegional({ form, set }: { form: BusinessProfile; set: (k: keyof BusinessProfile, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-[var(--color-brand-500)]/5 border border-[var(--color-brand-500)]/20 p-4">
        <p className="text-sm text-[var(--color-text-primary)] font-medium">Configuración regional — Ecuador</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">Esta versión del sistema opera exclusivamente en la República del Ecuador conforme a la normativa del SRI.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Idioma</label>
          <input value="Español (Ecuador)" readOnly className={`${inputCls} opacity-60 cursor-not-allowed`} />
        </div>
        <div>
          <label className={labelCls}>Zona Horaria</label>
          <input value="America/Guayaquil (UTC-5)" readOnly className={`${inputCls} opacity-60 cursor-not-allowed`} />
        </div>
        <div>
          <label className={labelCls}>Moneda</label>
          <input value="USD — Dólar Estadounidense" readOnly className={`${inputCls} opacity-60 cursor-not-allowed`} />
        </div>
        <div>
          <label className={labelCls}>Formato de Fecha</label>
          <input value="DD/MM/AAAA" readOnly className={`${inputCls} opacity-60 cursor-not-allowed`} />
        </div>
      </div>
    </div>
  );
}

function SectionNotificaciones({ form, set }: { form: BusinessProfile; set: (k: keyof BusinessProfile, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Email de Notificaciones</label>
        <input
          type="email"
          value={form.email}
          onChange={e => set("email", e.target.value)}
          placeholder="notificaciones@empresa.com"
          className={inputCls}
        />
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Se enviarán notificaciones de facturas emitidas a esta dirección.
        </p>
      </div>
      <div className="rounded-lg bg-[var(--color-brand-500)]/5 border border-[var(--color-brand-500)]/20 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={16} className="text-[var(--color-brand-500)] mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">Envío automático activado</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Al emitir una factura, se enviará automáticamente un email al cliente con los detalles.
              Configure <code className="text-xs bg-[var(--color-dashboard-border)] px-1 rounded">RESEND_API_KEY</code> y{" "}
              <code className="text-xs bg-[var(--color-dashboard-border)] px-1 rounded">EMAIL_FROM</code> en las variables de entorno.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   VALIDATION
   ============================================ */
function validate(form: BusinessProfile, section: SectionKey): FieldError {
  const errs: FieldError = {};
  if (section === "perfil") {
    if (!form.ruc.trim()) errs.ruc = "El RUC es obligatorio";
    else if (!/^\d{13}$/.test(form.ruc.trim())) errs.ruc = "El RUC debe tener exactamente 13 dígitos";
    if (!form.razonSocial.trim()) errs.razonSocial = "La razón social es obligatoria";
  }
  if (section === "sucursales") {
    if (!form.direccionMatriz.trim()) errs.direccionMatriz = "La dirección matriz es obligatoria";
  }
  if (section === "contacto") {
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Email inválido";
  }
  if (section === "facturacion") {
    if (!form.establishment.trim()) errs.establishment = "Obligatorio";
    if (!form.emissionPoint.trim()) errs.emissionPoint = "Obligatorio";
  }
  return errs;
}

/* ============================================
   MAIN PAGE
   ============================================ */
export default function ConfiguracionPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);
  const [form, setForm] = useState<BusinessProfile>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FieldError>({});

  useEffect(() => {
    fetch("/api/business-profile")
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) {
          setForm(prev => ({
            ...prev,
            ruc: data.ruc || "",
            razonSocial: data.razonSocial || "",
            nombreComercial: data.nombreComercial || "",
            direccionMatriz: data.direccionMatriz || "",
            direccionSucursal: data.direccionSucursal || "",
            telefono: data.telefono || "",
            email: data.email || "",
            website: data.website || "",
            logoUrl: data.logoUrl || "",
            ambiente: data.ambiente || "PRUEBAS",
            obligadoContabilidad: data.obligadoContabilidad || false,
            contribuyenteEspecial: data.contribuyenteEspecial || "",
            regimenRimpe: data.regimenRimpe || false,
            ivaRate: data.ivaRate || 15,
            establishment: data.establishment || "001",
            emissionPoint: data.emissionPoint || "001",
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = useCallback((k: keyof BusinessProfile, v: unknown) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const next = { ...e }; delete next[k as string]; return next; });
  }, []);

  const handleSave = async () => {
    if (!activeSection) return;
    const errs = validate(form, activeSection);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      addToast({ message: "Corrija los errores antes de guardar", variant: "error" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/business-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Error al guardar");
      }
      addToast({ message: "Configuración guardada exitosamente", variant: "success" });
      setErrors({});
    } catch (err) {
      addToast({ message: err instanceof Error ? err.message : "Error al guardar", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    setActiveSection(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-brand-500)] border-t-transparent" />
      </div>
    );
  }

  /* ---- Section Detail View ---- */
  if (activeSection) {
    const sec = SECTIONS.find(s => s.key === activeSection)!;
    return (
      <div className="max-w-3xl">
        {/* Back header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-[var(--color-dashboard-surface-hover)] transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft size={18} className="text-[var(--color-text-primary)]" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <span className="text-[var(--color-brand-500)]">{sec.icon}</span>
              {sec.name}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">{sec.description}</p>
          </div>
        </div>

        {/* Section content */}
        <div className={sectionCls}>
          {activeSection === "perfil"         && <SectionPerfil form={form} errors={errors} set={set} />}
          {activeSection === "sucursales"     && <SectionSucursales form={form} errors={errors} set={set} />}
          {activeSection === "contacto"       && <SectionContacto form={form} errors={errors} set={set} />}
          {activeSection === "visual"         && <SectionVisual form={form} set={set} />}
          {activeSection === "facturacion"    && <SectionFacturacion form={form} errors={errors} set={set} />}
          {activeSection === "regional"       && <SectionRegional form={form} set={set} />}
          {activeSection === "notificaciones" && <SectionNotificaciones form={form} set={set} />}
        </div>

        {/* Action buttons at the bottom */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end mt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <X size={15} /> Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Save size={15} /> {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    );
  }

  /* ---- Hub — icon cards grid ---- */
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Settings size={22} className="text-[var(--color-brand-500)]" />
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Configuración</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Gestiona todos los ajustes de tu empresa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTIONS.map(sec => (
          <button
            key={sec.key}
            type="button"
            onClick={() => { setErrors({}); setActiveSection(sec.key); }}
            className="flex items-center gap-4 p-5 rounded-xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] hover:border-[var(--color-brand-500)] hover:bg-[var(--color-brand-500)]/5 transition-all text-left group"
          >
            <div className="w-11 h-11 rounded-xl bg-[var(--color-brand-500)]/10 flex items-center justify-center text-[var(--color-brand-500)] shrink-0 group-hover:bg-[var(--color-brand-500)]/20 transition-colors">
              {sec.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-[var(--color-text-primary)]">{sec.name}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{sec.description}</p>
            </div>
            <ChevronRight size={16} className="text-[var(--color-text-muted)] shrink-0 group-hover:text-[var(--color-brand-500)] transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}
