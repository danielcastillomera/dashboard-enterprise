"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Building2, Upload } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function ConfiguracionPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    ruc: "", razonSocial: "", nombreComercial: "",
    direccionMatriz: "", direccionSucursal: "",
    telefono: "", email: "", website: "", logoUrl: "",
    ambiente: "PRUEBAS", obligadoContabilidad: false,
    contribuyenteEspecial: "", regimenRimpe: false,
    ivaRate: 15, establishment: "001", emissionPoint: "001",
  });

  useEffect(() => {
    fetch("/api/business-profile").then(r => r.json()).then(data => {
      if (data && data.ruc) {
        setForm({
          ruc: data.ruc || "", razonSocial: data.razonSocial || "", nombreComercial: data.nombreComercial || "",
          direccionMatriz: data.direccionMatriz || "", direccionSucursal: data.direccionSucursal || "",
          telefono: data.telefono || "", email: data.email || "", website: data.website || "",
          logoUrl: data.logoUrl || "", ambiente: data.ambiente || "PRUEBAS",
          obligadoContabilidad: data.obligadoContabilidad || false,
          contribuyenteEspecial: data.contribuyenteEspecial || "", regimenRimpe: data.regimenRimpe || false,
          ivaRate: data.ivaRate || 15, establishment: data.establishment || "001", emissionPoint: data.emissionPoint || "001",
        });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.ruc || !form.razonSocial || !form.direccionMatriz) {
      addToast({ message: "Complete los campos obligatorios: RUC, Razón Social y Dirección Matriz", variant: "info" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/business-profile", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al guardar");
      addToast({ message: "Configuración guardada exitosamente", variant: "success" });
    } catch { addToast({ message: "Error al guardar configuración", variant: "error" }); }
    finally { setSaving(false); }
  };

  const inputCls = "w-full px-3 py-2 rounded-lg bg-[var(--color-dashboard-input)] border border-[var(--color-dashboard-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]";
  const labelCls = "block text-xs font-medium text-[var(--color-text-muted)] mb-1";
  const sectionCls = "rounded-xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] p-6";

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-brand-500)] border-t-transparent" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2"><Settings size={24} /> Configuración de Empresa</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Datos que aparecen en las facturas electrónicas</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[var(--color-brand-500)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
          <Save size={16} /> {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>

      {/* Datos Tributarios */}
      <div className={sectionCls}>
        <h2 className="font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2"><Building2 size={18} /> Datos Tributarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>R.U.C. *</label>
            <input value={form.ruc} onChange={e => setForm(f => ({ ...f, ruc: e.target.value }))} placeholder="1791309863001" maxLength={13} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Razón Social *</label>
            <input value={form.razonSocial} onChange={e => setForm(f => ({ ...f, razonSocial: e.target.value }))} placeholder="EMPRESA S.A." className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Nombre Comercial</label>
            <input value={form.nombreComercial} onChange={e => setForm(f => ({ ...f, nombreComercial: e.target.value }))} placeholder="Mi Empresa" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Contribuyente Especial No.</label>
            <input value={form.contribuyenteEspecial} onChange={e => setForm(f => ({ ...f, contribuyenteEspecial: e.target.value }))} placeholder="0590" className={inputCls} />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.obligadoContabilidad} onChange={e => setForm(f => ({ ...f, obligadoContabilidad: e.target.checked }))} className="rounded" />
              <span className="text-sm text-[var(--color-text-primary)]">Obligado a llevar contabilidad</span>
            </label>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.regimenRimpe} onChange={e => setForm(f => ({ ...f, regimenRimpe: e.target.checked }))} className="rounded" />
              <span className="text-sm text-[var(--color-text-primary)]">Régimen RIMPE</span>
            </label>
          </div>
        </div>
      </div>

      {/* Direcciones */}
      <div className={sectionCls}>
        <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Direcciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelCls}>Dirección Matriz *</label>
            <input value={form.direccionMatriz} onChange={e => setForm(f => ({ ...f, direccionMatriz: e.target.value }))} placeholder="Av. Principal y Calle Secundaria" className={inputCls} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Dirección Sucursal</label>
            <input value={form.direccionSucursal} onChange={e => setForm(f => ({ ...f, direccionSucursal: e.target.value }))} placeholder="Dirección de la sucursal (opcional)" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div className={sectionCls}>
        <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Contacto</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Teléfono</label>
            <input value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} placeholder="(02) 3934187" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" placeholder="info@empresa.com" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Sitio Web</label>
            <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="www.empresa.com" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className={sectionCls}>
        <h2 className="font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2"><Upload size={18} /> Logo de la Empresa</h2>
        <div className="flex items-start gap-6">
          {form.logoUrl ? (
            <img src={form.logoUrl} alt="Logo" className="w-24 h-24 object-contain rounded-lg border border-[var(--color-dashboard-border)]" />
          ) : (
            <div className="w-24 h-24 flex items-center justify-center rounded-lg border-2 border-dashed border-[var(--color-dashboard-border)] text-[var(--color-text-muted)]">
              <Building2 size={32} />
            </div>
          )}
          <div className="flex-1">
            <label className={labelCls}>URL del Logo (SVG, PNG, JPG)</label>
            <input value={form.logoUrl} onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))} placeholder="https://example.com/logo.png" className={inputCls} />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Ingrese la URL de la imagen del logo. Recomendado: 200x200px mínimo.</p>
          </div>
        </div>
      </div>

      {/* Facturación */}
      <div className={sectionCls}>
        <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Configuración de Facturación</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Ambiente SRI</label>
            <select value={form.ambiente} onChange={e => setForm(f => ({ ...f, ambiente: e.target.value }))} className={inputCls}>
              <option value="PRUEBAS">PRUEBAS</option>
              <option value="PRODUCCION">PRODUCCIÓN</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Establecimiento</label>
            <input value={form.establishment} onChange={e => setForm(f => ({ ...f, establishment: e.target.value }))} maxLength={3} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Punto de Emisión</label>
            <input value={form.emissionPoint} onChange={e => setForm(f => ({ ...f, emissionPoint: e.target.value }))} maxLength={3} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Tarifa IVA (%)</label>
            <input type="number" value={form.ivaRate} onChange={e => setForm(f => ({ ...f, ivaRate: Number(e.target.value) }))} className={inputCls} />
          </div>
        </div>
      </div>
    </div>
  );
}
