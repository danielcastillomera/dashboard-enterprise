"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Type, ZoomIn, Eye, MousePointer, Link2, RotateCcw } from "lucide-react";

/* ============================================
   ACCESSIBILITY WIDGET — WCAG 2.1 / 2.2
   
   Funcionalidades:
   - Aumentar/reducir tamaño de fuente
   - Alto contraste
   - Reducir movimiento
   - Resaltar enlaces
   - Cursor grande
   
   Persiste preferencias en localStorage.
   Se adapta al tema claro/oscuro del dashboard.
   
   Cumple con:
   - WCAG 2.1 Level AA
   - WCAG 2.2 Focus Appearance
   
   Desarrollado por Daniel Fernando Castillo Mera
   ============================================ */

const STORAGE_KEY = "dashboard_a11y_settings";

interface A11ySettings {
  fontSize: number;       // 0 = normal, 1 = large, 2 = extra large
  highContrast: boolean;
  reducedMotion: boolean;
  highlightLinks: boolean;
  largeCursor: boolean;
}

const DEFAULT_SETTINGS: A11ySettings = {
  fontSize: 0,
  highContrast: false,
  reducedMotion: false,
  highlightLinks: false,
  largeCursor: false,
};

const FONT_SIZES = ["100%", "112%", "125%"];

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<A11ySettings>(DEFAULT_SETTINGS);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as A11ySettings;
        setSettings(parsed);
        applySettings(parsed);
      }
    } catch { /* */ }
  }, []);

  const applySettings = useCallback((s: A11ySettings) => {
    const html = document.documentElement;

    // Font size
    html.style.fontSize = FONT_SIZES[s.fontSize] || "100%";

    // High contrast
    html.classList.toggle("a11y-high-contrast", s.highContrast);

    // Reduced motion
    html.classList.toggle("a11y-reduced-motion", s.reducedMotion);

    // Highlight links
    html.classList.toggle("a11y-highlight-links", s.highlightLinks);

    // Large cursor
    html.classList.toggle("a11y-large-cursor", s.largeCursor);
  }, []);

  const updateSetting = useCallback(
    <K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) => {
      const updated = { ...settings, [key]: value };
      setSettings(updated);
      applySettings(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch { /* */ }
    },
    [settings, applySettings]
  );

  const resetAll = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    applySettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* */ }
  }, [applySettings]);

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(DEFAULT_SETTINGS);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-16 left-4 z-[60] w-12 h-12 rounded-full bg-[var(--color-brand-500)] text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
        aria-label="Abrir menú de accesibilidad"
        title="Accesibilidad"
      >
        {/* Accessibility icon (universal) */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="4.5" r="2" />
          <path d="M12 7v4" />
          <path d="M6.5 9.5L12 11l5.5-1.5" />
          <path d="M8 18l4-7 4 7" />
        </svg>
        {hasChanges && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <div
            className="fixed bottom-32 left-4 z-[65] w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] shadow-2xl overflow-hidden"
            role="dialog"
            aria-label="Opciones de accesibilidad"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-dashboard-border)]">
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="4.5" r="2" />
                  <path d="M12 7v4" />
                  <path d="M6.5 9.5L12 11l5.5-1.5" />
                  <path d="M8 18l4-7 4 7" />
                </svg>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">Accesibilidad</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-[var(--color-dashboard-surface-hover)] text-[var(--color-text-muted)]"
                aria-label="Cerrar menú de accesibilidad"
              >
                <X size={16} />
              </button>
            </div>

            {/* Options */}
            <div className="p-3 space-y-2">
              {/* Font size */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)]">
                <div className="flex items-center gap-2">
                  <Type size={16} className="text-[var(--color-text-muted)]" />
                  <span className="text-xs font-medium text-[var(--color-text-primary)]">Tamaño de fuente</span>
                </div>
                <div className="flex gap-1">
                  {["A", "A+", "A++"].map((label, i) => (
                    <button
                      key={i}
                      onClick={() => updateSetting("fontSize", i)}
                      className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${
                        settings.fontSize === i
                          ? "bg-[var(--color-brand-500)] text-white"
                          : "bg-[var(--color-dashboard-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                      }`}
                      aria-label={`Fuente ${label}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle options */}
              {[
                { key: "highContrast" as const, icon: <Eye size={16} />, label: "Alto contraste" },
                { key: "reducedMotion" as const, icon: <ZoomIn size={16} />, label: "Reducir movimiento" },
                { key: "highlightLinks" as const, icon: <Link2 size={16} />, label: "Resaltar enlaces" },
                { key: "largeCursor" as const, icon: <MousePointer size={16} />, label: "Cursor grande" },
              ].map(({ key, icon, label }) => (
                <button
                  key={key}
                  onClick={() => updateSetting(key, !settings[key])}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-colors ${
                    settings[key]
                      ? "bg-[var(--color-brand-500)]/10 border-[var(--color-brand-500)]/30 text-[var(--color-brand-500)]"
                      : "bg-[var(--color-dashboard-bg)] border-[var(--color-dashboard-border)] text-[var(--color-text-primary)]"
                  }`}
                  aria-pressed={settings[key]}
                >
                  <div className="flex items-center gap-2">
                    <span className={settings[key] ? "text-[var(--color-brand-500)]" : "text-[var(--color-text-muted)]"}>
                      {icon}
                    </span>
                    <span className="text-xs font-medium">{label}</span>
                  </div>
                  <div className={`w-8 h-4.5 rounded-full transition-colors ${settings[key] ? "bg-[var(--color-brand-500)]" : "bg-[var(--color-dashboard-border)]"}`}>
                    <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${settings[key] ? "translate-x-4 ml-0.5" : "translate-x-0.5"}`} />
                  </div>
                </button>
              ))}

              {/* Reset */}
              {hasChanges && (
                <button
                  onClick={resetAll}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)] transition-colors"
                >
                  <RotateCcw size={14} /> Restablecer valores predeterminados
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-[var(--color-dashboard-border)]">
              <p className="text-[10px] text-[var(--color-text-muted)] text-center">
                Cumple con WCAG 2.1 Nivel AA
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
