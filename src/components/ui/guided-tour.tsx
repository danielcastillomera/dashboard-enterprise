"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronRight, ChevronLeft, X, Sparkles } from "lucide-react";

/* ============================================
   GUIDED TOUR — INTERACTIVE ONBOARDING
   
   Recorre visualmente cada elemento del dashboard,
   destacando paneles, botones y módulos con un 
   spotlight animado.
   
   Basado en la investigación de mejores prácticas
   de onboarding de Stripe, Shopify y Linear.
   
   Desarrollado por Daniel Fernando Castillo Mera
   ============================================ */

const TOUR_VERSION = "v3.1.0";
const STORAGE_KEY = "dashboard_tour_completed";
const SKIP_DELAY = 5;

interface TourStep {
  /** CSS selector del elemento a destacar */
  target: string;
  /** Título del paso */
  title: string;
  /** Descripción */
  description: string;
  /** Posición del tooltip relativo al elemento */
  position: "top" | "bottom" | "left" | "right";
}

const STEPS: TourStep[] = [
  {
    target: "[data-tour='sidebar']",
    title: "Menú de navegación",
    description: "Desde aquí puede acceder a todos los módulos del sistema: Panel, Ventas, Compras, Facturación, Inventario y más.",
    position: "right",
  },
  {
    target: "[data-tour='header']",
    title: "Barra superior",
    description: "Contiene la búsqueda global (Ctrl+K), el cambio de tema claro/oscuro, notificaciones en tiempo real y el menú de usuario.",
    position: "bottom",
  },
  {
    target: "[data-tour='main-content']",
    title: "Área de contenido",
    description: "Aquí se muestra el módulo activo. El Panel de Control muestra los indicadores clave de su negocio: ingresos, ventas, inventario y gráficos.",
    position: "top",
  },
  {
    target: "[data-tour='theme-toggle']",
    title: "Cambiar tema",
    description: "Alterne entre modo claro, oscuro o automático del sistema. La transición es suave y todas las pantallas se adaptan.",
    position: "bottom",
  },
  {
    target: "[data-tour='notifications']",
    title: "Notificaciones",
    description: "Reciba alertas en tiempo real sobre nuevos pedidos, stock bajo y ventas registradas. El contador muestra las no leídas.",
    position: "bottom",
  },
  {
    target: "[data-tour='user-menu']",
    title: "Menú de usuario",
    description: "Acceda a Configuración del sistema o cierre su sesión de forma segura desde aquí.",
    position: "bottom",
  },
  {
    target: "[data-tour='accessibility']",
    title: "Accesibilidad",
    description: "Ajuste el tamaño de fuente, active alto contraste, reduzca animaciones o agrande el cursor. Cumple con WCAG 2.1.",
    position: "top",
  },
];

export function GuidedTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [skipTimer, setSkipTimer] = useState(SKIP_DELAY);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Check if tour should show
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== TOUR_VERSION) {
        // Small delay so the dashboard renders first
        const t = setTimeout(() => setActive(true), 1500);
        return () => clearTimeout(t);
      }
    } catch { /* */ }
  }, []);

  // Highlight target element
  useEffect(() => {
    if (!active) return;
    const current = STEPS[step];
    if (!current) return;

    const findEl = () => {
      const el = document.querySelector(current.target);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect(r);
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        setRect(null);
      }
    };

    findEl();
    // Re-measure on resize
    window.addEventListener("resize", findEl);
    return () => window.removeEventListener("resize", findEl);
  }, [active, step]);

  // Skip countdown
  useEffect(() => {
    if (!active) return;
    setSkipTimer(SKIP_DELAY);
    const iv = setInterval(() => setSkipTimer((p) => (p <= 1 ? 0 : p - 1)), 1000);
    return () => clearInterval(iv);
  }, [active]);

  const finish = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY, TOUR_VERSION); } catch { /* */ }
    setActive(false);
  }, []);

  if (!active) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (!rect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    const pad = 16;
    switch (current.position) {
      case "bottom":
        return { top: rect.bottom + pad, left: Math.max(16, Math.min(rect.left, window.innerWidth - 340)), maxWidth: "calc(100vw - 32px)" };
      case "top":
        return { bottom: window.innerHeight - rect.top + pad, left: Math.max(16, Math.min(rect.left, window.innerWidth - 340)), maxWidth: "calc(100vw - 32px)" };
      case "right":
        return { top: rect.top, left: Math.min(rect.right + pad, window.innerWidth - 340), maxWidth: "calc(100vw - 32px)" };
      case "left":
        return { top: rect.top, right: window.innerWidth - rect.left + pad, maxWidth: "calc(100vw - 32px)" };
      default:
        return { top: rect.bottom + pad, left: 16 };
    }
  };

  return (
    <div className="fixed inset-0 z-[90]">
      {/* Dark overlay with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - 6}
                y={rect.top - 6}
                width={rect.width + 12}
                height={rect.height + 12}
                rx={12}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.6)"
          mask="url(#tour-mask)"
          style={{ pointerEvents: "auto" }}
          onClick={finish}
        />
      </svg>

      {/* Highlight border around target */}
      {rect && (
        <div
          className="absolute border-2 border-[var(--color-brand-500)] rounded-xl pointer-events-none animate-pulse"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute z-[91] w-80 max-w-[calc(100vw-2rem)] bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] rounded-2xl shadow-2xl overflow-hidden"
        style={getTooltipStyle()}
      >
        {/* Progress */}
        <div className="h-1 bg-[var(--color-dashboard-border)]">
          <div className="h-full bg-[var(--color-brand-500)] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-[var(--color-text-muted)]">
              {step + 1} / {STEPS.length}
            </span>
            <button
              onClick={finish}
              disabled={skipTimer > 0}
              className={`text-xs px-2 py-1 rounded-md transition-colors ${
                skipTimer > 0
                  ? "text-[var(--color-text-muted)] opacity-50 cursor-not-allowed"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-dashboard-surface-hover)]"
              }`}
            >
              {skipTimer > 0 ? `Saltar (${skipTimer}s)` : <><X size={12} className="inline" /> Saltar</>}
            </button>
          </div>

          <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">{current.title}</h3>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{current.description}</p>
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-dashboard-border)] bg-[var(--color-dashboard-bg)]/50">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              step === 0 ? "text-[var(--color-text-muted)] cursor-not-allowed" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-dashboard-surface)]"
            }`}
          >
            <ChevronLeft size={14} /> Anterior
          </button>
          {isLast ? (
            <button onClick={finish} className="flex items-center gap-1 text-xs font-semibold px-4 py-1.5 rounded-lg bg-[var(--color-brand-500)] text-white hover:opacity-90">
              Comenzar <Sparkles size={14} />
            </button>
          ) : (
            <button onClick={() => setStep((s) => s + 1)} className="flex items-center gap-1 text-xs font-semibold px-4 py-1.5 rounded-lg bg-[var(--color-brand-500)] text-white hover:opacity-90">
              Siguiente <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
