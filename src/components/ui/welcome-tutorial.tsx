"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, ShoppingCart, Users, FileText, Package,
  BarChart3, Settings, ChevronRight, ChevronLeft, X, Sparkles,
} from "lucide-react";

/* ============================================
   WELCOME TUTORIAL — ONBOARDING GUIDE
   
   Aparece automáticamente para usuarios nuevos
   o cuando hay funcionalidades nuevas.
   
   Características:
   - Progreso visual con pasos numerados
   - Navegación anterior/siguiente
   - Botón "Saltar" con cuenta regresiva (5s)
   - Persistencia en localStorage
   - Responsive (móvil y PC)
   
   Desarrollado por Daniel Fernando Castillo Mera
   ============================================ */

const TUTORIAL_VERSION = "v3.0.0";
const STORAGE_KEY = "dashboard_tutorial_completed";
const SKIP_COUNTDOWN = 5;

interface TutorialStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  tip?: string;
}

const STEPS: TutorialStep[] = [
  {
    icon: <Sparkles size={32} className="text-[var(--color-brand-500)]" />,
    title: "Bienvenido a Dashboard Enterprise",
    description: "Este sistema le permite gestionar su negocio de comercio y retail de forma integral. A continuación le mostraremos las funciones principales.",
    tip: "Esta guía solo aparece una vez. Puede consultarla desde Configuración si lo necesita.",
  },
  {
    icon: <LayoutDashboard size={32} className="text-blue-500" />,
    title: "Panel de Control",
    description: "Visualice indicadores clave de su negocio: ingresos totales, ganancia real, productos vendidos y alertas de stock. Los gráficos muestran tendencias de ventas y distribución por categorías.",
    tip: "Use los filtros de tiempo (Hoy, Semana, Mes, Año) para ajustar el período de los datos.",
  },
  {
    icon: <Users size={32} className="text-green-500" />,
    title: "Gestión de Clientes",
    description: "Registre y administre sus clientes con validaciones ecuatorianas automáticas: cédula (10 dígitos), RUC (13 dígitos), celular (09XX) y teléfono fijo.",
    tip: "Los datos del cliente se usan automáticamente al momento de facturar.",
  },
  {
    icon: <ShoppingCart size={32} className="text-purple-500" />,
    title: "Ventas y Compras",
    description: "Registre ventas seleccionando productos del catálogo. Las compras actualizan automáticamente el inventario. Ambos módulos tienen historial con filtros por fecha.",
  },
  {
    icon: <Package size={32} className="text-orange-500" />,
    title: "Productos e Inventario",
    description: "Administre su catálogo completo con precios, costos, stock, categorías y marcas. El inventario muestra alertas visuales cuando un producto tiene stock bajo o está agotado.",
    tip: "Configure el stock mínimo por producto para recibir alertas automáticas.",
  },
  {
    icon: <FileText size={32} className="text-amber-500" />,
    title: "Facturación Electrónica",
    description: "Emita facturas conforme al SRI Ecuador con los 8 métodos de pago de la Tabla 24. El sistema genera automáticamente la clave de acceso de 49 dígitos, el XML y el documento RIDE en PDF.",
    tip: "Configure su RUC, establecimiento y punto de emisión en Configuración antes de facturar.",
  },
  {
    icon: <BarChart3 size={32} className="text-cyan-500" />,
    title: "Reportes y Exportación",
    description: "Genere reportes financieros con gráficos interactivos. Exporte datos en CSV, PDF o Excel (.xlsx) desde cualquier módulo del sistema.",
  },
  {
    icon: <Settings size={32} className="text-gray-500" />,
    title: "Configuración",
    description: "Configure su perfil empresarial, datos tributarios, sucursales, contacto, identidad visual y parámetros de facturación electrónica. La configuración regional está optimizada para Ecuador.",
    tip: "Asegúrese de completar todos los datos del perfil empresarial antes de emitir facturas.",
  },
];

export function WelcomeTutorial() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [skipCountdown, setSkipCountdown] = useState(SKIP_COUNTDOWN);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== TUTORIAL_VERSION) {
        setShow(true);
      }
    } catch {
      /* localStorage not available */
    }
  }, []);

  // Skip countdown
  useEffect(() => {
    if (!show) return;
    setSkipCountdown(SKIP_COUNTDOWN);
    setCanSkip(false);
    const interval = setInterval(() => {
      setSkipCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [show, step]);

  const completeTutorial = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, TUTORIAL_VERSION);
    } catch { /* */ }
    setShow(false);
  }, []);

  if (!show) return null;

  const currentStep = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-dashboard-surface)] rounded-2xl border border-[var(--color-dashboard-border)] shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-[var(--color-dashboard-border)]">
          <div
            className="h-full bg-[var(--color-brand-500)] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="text-xs font-medium text-[var(--color-text-muted)]">
            Paso {step + 1} de {STEPS.length}
          </span>
          <button
            onClick={completeTutorial}
            disabled={!canSkip}
            className={`flex items-center gap-1 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors ${
              canSkip
                ? "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)]"
                : "text-[var(--color-text-muted)] cursor-not-allowed opacity-50"
            }`}
            title={canSkip ? "Saltar tutorial" : `Espere ${skipCountdown}s`}
          >
            {canSkip ? (
              <>Saltar <X size={14} /></>
            ) : (
              <>Saltar ({skipCountdown}s)</>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-dashboard-bg)] flex items-center justify-center">
              {currentStep.icon}
            </div>
          </div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
            {currentStep.title}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-3">
            {currentStep.description}
          </p>
          {currentStep.tip && (
            <div className="bg-[var(--color-brand-500)]/5 border border-[var(--color-brand-500)]/20 rounded-lg px-4 py-2.5 mt-3">
              <p className="text-xs text-[var(--color-text-secondary)]">
                <span className="font-semibold text-[var(--color-brand-500)]">Consejo:</span> {currentStep.tip}
              </p>
            </div>
          )}
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-1.5 pb-4">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 bg-[var(--color-brand-500)]"
                  : i < step
                  ? "w-1.5 bg-[var(--color-brand-500)]/40"
                  : "w-1.5 bg-[var(--color-dashboard-border)]"
              }`}
              aria-label={`Ir al paso ${i + 1}`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--color-dashboard-border)] bg-[var(--color-dashboard-bg)]/50">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={isFirst}
            className={`flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              isFirst
                ? "text-[var(--color-text-muted)] cursor-not-allowed"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface)]"
            }`}
          >
            <ChevronLeft size={16} /> Anterior
          </button>

          {isLast ? (
            <button
              onClick={completeTutorial}
              className="flex items-center gap-1 text-sm font-semibold px-5 py-2 rounded-lg bg-[var(--color-brand-500)] text-white hover:opacity-90 transition-opacity"
            >
              Comenzar <Sparkles size={16} />
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-1 text-sm font-semibold px-5 py-2 rounded-lg bg-[var(--color-brand-500)] text-white hover:opacity-90 transition-opacity"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
