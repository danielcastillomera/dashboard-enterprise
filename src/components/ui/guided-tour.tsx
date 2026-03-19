"use client";

import { useState, useEffect, useCallback, useLayoutEffect } from "react";
import { ChevronRight, ChevronLeft, Sparkles, X } from "lucide-react";

/* ============================================
   GUIDED TOUR v3 — TOOLTIP JUNTO AL ELEMENTO
   
   El tooltip se posiciona inteligentemente al lado
   del elemento destacado, asegurando que siempre
   sea visible en la pantalla.
   
   Desarrollado por Daniel Fernando Castillo Mera
   ============================================ */

const TOURS = {
  onboarding: {
    version: "v3.4.0",
    storageKey: "tour_onboarding",
    steps: [
      { target: "[data-tour='sidebar']", title: "1. Menú de navegación", description: "Acceda a todos los módulos del sistema: Panel de Control, Ventas, Compras, Facturación, Inventario, Clientes, Reportes y Configuración. En celular, toque el ícono ☰ para abrir este menú." },
      { target: "[data-tour='header']", title: "2. Barra superior", description: "Aquí encuentra: la búsqueda rápida (Ctrl+K), el selector de tema (claro/oscuro), las notificaciones en tiempo real y su menú de usuario para cerrar sesión." },
      { target: "[data-tour='main-content']", title: "3. Área de trabajo", description: "Este es el espacio principal donde se muestra cada módulo. Ahora mismo ve el Panel de Control con indicadores de ventas, ingresos y gráficos de su negocio." },
      { target: "[data-tour='theme-toggle']", title: "4. Cambiar tema", description: "Seleccione entre modo claro ☀️, oscuro 🌙 o automático 🖥️. El sistema recordará su preferencia." },
      { target: "[data-tour='accessibility']", title: "5. Accesibilidad", description: "Ajuste el tamaño de la letra, active alto contraste, reduzca animaciones o agrande el cursor. Cumple con el estándar WCAG 2.1 Nivel AA." },
    ],
  },
  newFeatures: {
    version: "v3.4.0-nf",
    storageKey: "tour_features_v34",
    steps: [
      { target: "[data-tour='main-content']", title: "Auditoría de operaciones", description: "Nuevo: al eliminar clientes o productos, el sistema le pedirá un motivo y registrará quién realizó la operación." },
      { target: "[data-tour='accessibility']", title: "Widget de accesibilidad", description: "Nuevo: ajuste fuente, contraste y cursor desde este botón flotante. Cumple WCAG 2.1." },
    ],
  },
};

type TourId = keyof typeof TOURS;
const SKIP_SEC = 5;

export function GuidedTour() {
  const [tourId, setTourId] = useState<TourId | null>(null);
  const [step, setStep] = useState(0);
  const [skip, setSkip] = useState(SKIP_SEC);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [vpW, setVpW] = useState(0);
  const [vpH, setVpH] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const o = localStorage.getItem(TOURS.onboarding.storageKey);
        if (o !== TOURS.onboarding.version) { setTourId("onboarding"); return; }
        const n = localStorage.getItem(TOURS.newFeatures.storageKey);
        if (n !== TOURS.newFeatures.version) { setTourId("newFeatures"); return; }
      } catch { /* */ }
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  const tour = tourId ? TOURS[tourId] : null;
  const steps = tour?.steps || [];
  const cur = steps[step];

  useLayoutEffect(() => {
    if (!cur) { setRect(null); return; }
    const m = () => {
      setVpW(window.innerWidth);
      setVpH(window.innerHeight);
      const el = document.querySelector(cur.target);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect(r);
        // Scroll element into view if needed
        if (r.top < 0 || r.bottom > window.innerHeight) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => setRect(el.getBoundingClientRect()), 400);
        }
      } else {
        setRect(null);
      }
    };
    m();
    window.addEventListener("resize", m);
    return () => window.removeEventListener("resize", m);
  }, [cur]);

  useEffect(() => {
    if (!tourId) return;
    setSkip(SKIP_SEC);
    const iv = setInterval(() => setSkip(p => p <= 1 ? 0 : p - 1), 1000);
    return () => clearInterval(iv);
  }, [tourId]);

  const done = useCallback(() => {
    if (tour) try { localStorage.setItem(tour.storageKey, tour.version); } catch { /* */ }
    setTourId(null); setStep(0);
  }, [tour]);

  if (!tourId || !cur) return null;

  const isLast = step === steps.length - 1;
  const pct = ((step + 1) / steps.length) * 100;
  const pad = 8;
  const sp = rect ? { x: rect.left - pad, y: rect.top - pad, w: rect.width + pad * 2, h: rect.height + pad * 2 } : null;

  // Smart tooltip positioning: find best side with most space
  const tooltipW = 320;
  const tooltipH = 220;
  const gap = 16;

  const getTooltipPos = (): React.CSSProperties => {
    if (!rect || !vpW || !vpH) {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }

    const spaceRight = vpW - rect.right;
    const spaceLeft = rect.left;
    const spaceBottom = vpH - rect.bottom;
    const spaceTop = rect.top;

    // Try right
    if (spaceRight > tooltipW + gap) {
      return { top: Math.max(gap, Math.min(rect.top, vpH - tooltipH - gap)), left: rect.right + gap };
    }
    // Try left
    if (spaceLeft > tooltipW + gap) {
      return { top: Math.max(gap, Math.min(rect.top, vpH - tooltipH - gap)), left: rect.left - tooltipW - gap };
    }
    // Try bottom
    if (spaceBottom > tooltipH + gap) {
      return { top: rect.bottom + gap, left: Math.max(gap, Math.min(rect.left, vpW - tooltipW - gap)) };
    }
    // Try top
    if (spaceTop > tooltipH + gap) {
      return { top: rect.top - tooltipH - gap, left: Math.max(gap, Math.min(rect.left, vpW - tooltipW - gap)) };
    }
    // Fallback: center of screen
    return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  };

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true">
      {/* Overlay with spotlight */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "auto" }}>
        <defs>
          <mask id="sm">
            <rect width="100%" height="100%" fill="white" />
            {sp && <rect x={sp.x} y={sp.y} width={sp.w} height={sp.h} rx={14} fill="black" />}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.65)" mask="url(#sm)" />
      </svg>

      {/* Pulsing border */}
      {sp && (
        <div
          className="absolute border-2 border-[var(--color-brand-500)] rounded-2xl pointer-events-none animate-pulse"
          style={{ top: sp.y, left: sp.x, width: sp.w, height: sp.h }}
        />
      )}

      {/* Tooltip — positioned next to element */}
      <div
        className="absolute z-[91]"
        style={{ ...getTooltipPos(), width: tooltipW, maxWidth: "calc(100vw - 2rem)" }}
      >
        <div className="bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] rounded-2xl shadow-2xl overflow-hidden">
          {/* Progress */}
          <div className="h-1.5 bg-[var(--color-dashboard-border)]">
            <div className="h-full bg-[var(--color-brand-500)] transition-all duration-500 rounded-full" style={{ width: `${pct}%` }} />
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-[var(--color-brand-500)] uppercase tracking-wider">
                Paso {step + 1} de {steps.length}
              </span>
              <button
                onClick={done}
                disabled={skip > 0}
                className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                  skip > 0
                    ? "text-[var(--color-text-muted)] opacity-40 cursor-not-allowed"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-dashboard-surface-hover)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {skip > 0 ? `Omitir (${skip}s)` : <span className="flex items-center gap-1"><X size={12} /> Omitir</span>}
              </button>
            </div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-2">{cur.title}</h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{cur.description}</p>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-1.5 pb-3">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === step ? "w-6 h-2 bg-[var(--color-brand-500)]"
                  : i < step ? "w-2 h-2 bg-[var(--color-brand-500)]/40"
                  : "w-2 h-2 bg-[var(--color-dashboard-border)]"
                }`}
                aria-label={`Ir al paso ${i + 1}`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-dashboard-border)] bg-[var(--color-dashboard-bg)]/50">
            <button
              onClick={() => setStep(p => Math.max(0, p - 1))}
              disabled={step === 0}
              className={`flex items-center gap-1 text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
                step === 0 ? "text-[var(--color-text-muted)] cursor-not-allowed" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-dashboard-surface)]"
              }`}
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <button
              onClick={isLast ? done : () => setStep(p => p + 1)}
              className="flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-lg bg-[var(--color-brand-500)] text-white hover:opacity-90 transition-opacity"
            >
              {isLast ? <>Comenzar <Sparkles size={14} /></> : <>Siguiente <ChevronRight size={14} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
