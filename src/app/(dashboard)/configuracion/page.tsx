"use client";

import { useState } from "react";
import { Globe, DollarSign, Clock, Palette, Building2, Shield } from "lucide-react";
import { PageHeader, Card, CardHeader } from "@/components/ui";
import { getActiveTenantConfig } from "@/lib/tenant-config";

/* ============================================
   CONFIGURACIÓN — ENTERPRISE
   Estándar: Stripe Settings, Shopify Settings
   - Información del negocio
   - Moneda, idioma, zona horaria configurables
   - Apariencia y seguridad
   ============================================ */

export default function ConfiguracionPage() {
  const config = getActiveTenantConfig();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputClass = "w-full px-3 py-2 rounded-lg text-sm bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-500)] transition-colors";
  const selectClass = inputClass;
  const labelClass = "block text-sm font-medium text-[var(--color-text-secondary)] mb-1";

  return (
    <div>
      <PageHeader
        title="Configuración"
        description="Gestión del negocio, localización y preferencias del sistema"
      />

      {saved && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400" role="status">
          Configuración guardada correctamente
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Información del negocio */}
        <Card>
          <CardHeader title="Información del Negocio" icon={<Building2 size={18} />} />
          <div className="space-y-4">
            <div>
              <label htmlFor="business-name" className={labelClass}>Nombre del negocio</label>
              <input id="business-name" defaultValue={config.name} className={inputClass} />
            </div>
            <div>
              <label htmlFor="business-industry" className={labelClass}>Industria</label>
              <select id="business-industry" defaultValue={config.industry} className={selectClass}>
                <option value="ferreteria">Ferretería</option>
                <option value="ecommerce">E-Commerce</option>
                <option value="restaurante">Restaurante</option>
                <option value="tecnologia">Tecnología</option>
                <option value="farmacia">Farmacia</option>
                <option value="ropa">Ropa y Moda</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Localización */}
        <Card>
          <CardHeader title="Localización" icon={<Globe size={18} />} />
          <div className="space-y-4">
            <div>
              <label htmlFor="locale" className={labelClass}>Idioma del sistema</label>
              <select id="locale" defaultValue="es" className={selectClass}>
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label htmlFor="country" className={labelClass}>País</label>
              <select id="country" defaultValue="EC" className={selectClass}>
                <option value="EC">Ecuador</option>
                <option value="MX">México</option>
                <option value="CO">Colombia</option>
                <option value="GT">Guatemala</option>
                <option value="PE">Perú</option>
                <option value="US">Estados Unidos</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Moneda */}
        <Card>
          <CardHeader title="Moneda" icon={<DollarSign size={18} />} />
          <div className="space-y-4">
            <div>
              <label htmlFor="currency" className={labelClass}>Moneda principal</label>
              <select id="currency" defaultValue={config.currency} className={selectClass}>
                <option value="USD">USD — Dólar estadounidense ($)</option>
                <option value="MXN">MXN — Peso mexicano ($)</option>
                <option value="COP">COP — Peso colombiano ($)</option>
                <option value="GTQ">GTQ — Quetzal (Q)</option>
                <option value="PEN">PEN — Sol peruano (S/)</option>
                <option value="EUR">EUR — Euro (€)</option>
              </select>
            </div>
            <div>
              <label htmlFor="currency-display" className={labelClass}>Formato de visualización</label>
              <select id="currency-display" defaultValue="symbol" className={selectClass}>
                <option value="symbol">Símbolo ($100.00)</option>
                <option value="code">Código (USD 100.00)</option>
                <option value="name">Nombre (100.00 dólares)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Zona horaria */}
        <Card>
          <CardHeader title="Zona Horaria" icon={<Clock size={18} />} />
          <div className="space-y-4">
            <div>
              <label htmlFor="timezone" className={labelClass}>Zona horaria</label>
              <select id="timezone" defaultValue={config.timezone} className={selectClass}>
                <option value="America/Guayaquil">Ecuador (UTC-5)</option>
                <option value="America/Mexico_City">México Central (UTC-6)</option>
                <option value="America/Bogota">Colombia (UTC-5)</option>
                <option value="America/Guatemala">Guatemala (UTC-6)</option>
                <option value="America/Lima">Perú (UTC-5)</option>
                <option value="America/New_York">Este de EE.UU. (UTC-5)</option>
                <option value="America/Los_Angeles">Pacífico de EE.UU. (UTC-8)</option>
                <option value="Europe/Madrid">España (UTC+1)</option>
              </select>
            </div>
            <div>
              <label htmlFor="date-format" className={labelClass}>Formato de fecha</label>
              <select id="date-format" defaultValue="dd/MM/yyyy" className={selectClass}>
                <option value="dd/MM/yyyy">DD/MM/AAAA (31/12/2026)</option>
                <option value="MM/dd/yyyy">MM/DD/AAAA (12/31/2026)</option>
                <option value="yyyy-MM-dd">AAAA-MM-DD (2026-12-31)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Apariencia */}
        <Card>
          <CardHeader title="Apariencia" icon={<Palette size={18} />} />
          <div className="space-y-4">
            <div>
              <label htmlFor="brand-color" className={labelClass}>Color de marca</label>
              <div className="flex gap-2">
                <input id="brand-color" type="color" defaultValue={config.brandColor} className="w-10 h-10 rounded-lg border border-[var(--color-dashboard-border)] cursor-pointer" />
                <input defaultValue={config.brandColor} className={inputClass} readOnly />
              </div>
            </div>
          </div>
        </Card>

        {/* Seguridad */}
        <Card>
          <CardHeader title="Seguridad" icon={<Shield size={18} />} />
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">Autenticación de dos factores</p>
                <p className="text-xs text-[var(--color-text-muted)]">Requerir 2FA para todos los administradores</p>
              </div>
              <div className="w-10 h-6 rounded-full bg-[var(--color-dashboard-border)] relative cursor-pointer">
                <div className="w-4 h-4 rounded-full bg-white absolute top-1 left-1 transition-transform" />
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">Tiempo de sesión</p>
                <p className="text-xs text-[var(--color-text-muted)]">Cierre automático de sesión</p>
              </div>
              <select defaultValue="8h" className="px-2 py-1 rounded-lg text-sm bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] text-[var(--color-text-primary)]">
                <option value="1h">1 hora</option>
                <option value="4h">4 horas</option>
                <option value="8h">8 horas</option>
                <option value="24h">24 horas</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* Guardar */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-lg bg-[var(--color-brand-500)] text-white text-sm font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:ring-offset-2 transition-colors"
        >
          Guardar Configuración
        </button>
      </div>
    </div>
  );
}
