"use client";

import { useEffect, useRef, useCallback, useState } from "react";

/* ============================================
   INACTIVITY TIMEOUT — AUTO LOGOUT
   
   Cierra la sesión automáticamente después de
   15 minutos de inactividad (estándar OWASP).
   
   Eventos monitoreados: mouse, teclado, scroll, touch.
   Muestra advertencia 2 minutos antes del cierre.
   
   Referencias:
   - OWASP Session Management Cheat Sheet
   - NIST SP 800-63B §7.1 — Session timeouts
   
   Desarrollado por Daniel Fernando Castillo Mera
   ============================================ */

const TIMEOUT_MS = 15 * 60 * 1000;   // 15 minutes
const WARNING_MS = 13 * 60 * 1000;   // Show warning at 13 min (2 min before)
const EVENTS = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"] as const;

export function InactivityTimeout() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(120);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch { /* */ }
    window.location.href = "/login?reason=inactivity";
  }, []);

  const resetTimers = useCallback(() => {
    setShowWarning(false);
    setCountdown(120);

    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    warningRef.current = setTimeout(() => {
      setShowWarning(true);
    }, WARNING_MS);

    timerRef.current = setTimeout(() => {
      logout();
    }, TIMEOUT_MS);
  }, [logout]);

  // Countdown when warning is visible
  useEffect(() => {
    if (!showWarning) return;
    const iv = setInterval(() => {
      setCountdown(p => {
        if (p <= 1) { clearInterval(iv); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [showWarning]);

  // Setup event listeners
  useEffect(() => {
    resetTimers();
    const handler = () => resetTimers();
    EVENTS.forEach(e => document.addEventListener(e, handler, { passive: true }));
    return () => {
      EVENTS.forEach(e => document.removeEventListener(e, handler));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [resetTimers]);

  if (!showWarning) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-dashboard-surface)] rounded-2xl border border-[var(--color-dashboard-border)] shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-2">Sesión por expirar</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Su sesión se cerrará automáticamente por inactividad en:
          </p>
          <p className="text-3xl font-bold text-[var(--color-brand-500)] mb-4 font-mono">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mb-5">
            Mueva el mouse o toque la pantalla para mantener su sesión activa.
          </p>
          <button
            onClick={resetTimers}
            className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg bg-[var(--color-brand-500)] text-white hover:opacity-90 transition-opacity"
          >
            Continuar trabajando
          </button>
        </div>
      </div>
    </div>
  );
}
