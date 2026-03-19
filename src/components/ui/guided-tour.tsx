"use client";

import { useState, useEffect, useCallback, useLayoutEffect } from "react";
import { ChevronRight, ChevronLeft, Sparkles, X } from "lucide-react";

const TOURS = {
  onboarding: {
    version: "v3.2.0",
    storageKey: "tour_onboarding",
    steps: [
      { target: "[data-tour='sidebar']", title: "Menú de navegación", description: "Acceda a todos los módulos: Panel, Ventas, Compras, Facturación, Inventario, Clientes y más. En móvil, abra el menú con el ícono de hamburguesa.", position: "right" as const },
      { target: "[data-tour='header']", title: "Barra superior", description: "Contiene la búsqueda global (Ctrl+K), cambio de tema, notificaciones y el menú de usuario.", position: "bottom" as const },
      { target: "[data-tour='main-content']", title: "Área de trabajo", description: "Aquí se muestra el módulo activo. El Panel de Control presenta indicadores clave, gráficos y alertas.", position: "bottom" as const },
      { target: "[data-tour='theme-toggle']", title: "Tema visual", description: "Alterne entre modo claro, oscuro o automático. Todo el sistema se adapta al tema.", position: "bottom" as const },
      { target: "[data-tour='accessibility']", title: "Accesibilidad (WCAG 2.1)", description: "Ajuste tamaño de fuente, contraste, animaciones y cursor. Se guardan automáticamente.", position: "top" as const },
    ],
  },
  newFeatures: {
    version: "v3.2.0-nf",
    storageKey: "tour_features_v32",
    steps: [
      { target: "[data-tour='accessibility']", title: "Widget de accesibilidad", description: "Nuevo: ajuste fuente, contraste, animaciones y cursor. Cumple WCAG 2.1 Nivel AA.", position: "top" as const },
      { target: "[data-tour='main-content']", title: "Exportar a Excel", description: "Nuevo: exporte datos en Excel (.xlsx), CSV y PDF desde cualquier módulo.", position: "bottom" as const },
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
    const m = () => { const el = document.querySelector(cur.target); setRect(el ? el.getBoundingClientRect() : null); };
    m();
    window.addEventListener("resize", m);
    window.addEventListener("scroll", m, true);
    return () => { window.removeEventListener("resize", m); window.removeEventListener("scroll", m, true); };
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
  const s = rect ? { x: rect.left - 8, y: rect.top - 8, w: rect.width + 16, h: rect.height + 16 } : null;

  // Tooltip is fixed-centered at bottom of viewport — always visible

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true">
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "auto" }}>
        <defs><mask id="sm"><rect width="100%" height="100%" fill="white" />{s && <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={14} fill="black" />}</mask></defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.65)" mask="url(#sm)" />
      </svg>
      {s && <div className="absolute border-2 border-[var(--color-brand-500)] rounded-2xl pointer-events-none animate-pulse" style={{ top: s.y, left: s.x, width: s.w, height: s.h }} />}
      {/* Tooltip — always centered at bottom of viewport */}
      <div className="fixed z-[91] bottom-6 left-1/2 -translate-x-1/2 w-80 max-w-[calc(100vw-2rem)]">
        <div className="bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1 bg-[var(--color-dashboard-border)]"><div className="h-full bg-[var(--color-brand-500)] transition-all duration-500" style={{ width: `${pct}%` }} /></div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Paso {step + 1} de {steps.length}</span>
              <button onClick={done} disabled={skip > 0} className={`text-xs px-2 py-1 rounded-md ${skip > 0 ? "text-[var(--color-text-muted)] opacity-40 cursor-not-allowed" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-dashboard-surface-hover)]"}`}>
                {skip > 0 ? `Omitir (${skip}s)` : <span className="flex items-center gap-1"><X size={12} /> Omitir</span>}
              </button>
            </div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-1.5">{cur.title}</h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{cur.description}</p>
          </div>
          <div className="flex justify-center gap-1.5 pb-3">{steps.map((_, i) => <button key={i} onClick={() => setStep(i)} className={`rounded-full transition-all ${i === step ? "w-5 h-1.5 bg-[var(--color-brand-500)]" : i < step ? "w-1.5 h-1.5 bg-[var(--color-brand-500)]/40" : "w-1.5 h-1.5 bg-[var(--color-dashboard-border)]"}`} aria-label={`Paso ${i + 1}`} />)}</div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-dashboard-border)] bg-[var(--color-dashboard-bg)]/50">
            <button onClick={() => setStep(p => Math.max(0, p - 1))} disabled={step === 0} className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg ${step === 0 ? "text-[var(--color-text-muted)] cursor-not-allowed" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-dashboard-surface)]"}`}><ChevronLeft size={14} /> Anterior</button>
            <button onClick={isLast ? done : () => setStep(p => p + 1)} className="flex items-center gap-1 text-xs font-semibold px-4 py-1.5 rounded-lg bg-[var(--color-brand-500)] text-white hover:opacity-90">{isLast ? <>Comenzar <Sparkles size={14} /></> : <>Siguiente <ChevronRight size={14} /></>}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
