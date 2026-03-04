"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

/* ============================================
   FULL SCREEN LOADER
   
   Overlay centrado en el dashboard con indicador
   circular de progreso real y mensajes descriptivos.
   ============================================ */

interface FullScreenLoaderProps {
  /** Estado actual */
  state: "loading" | "success" | "error" | "idle";
  /** Mensaje principal */
  message?: string;
  /** Submensaje (opcional) */
  detail?: string;
  /** Porcentaje real de progreso (0-100). Si se omite, se anima automáticamente. */
  progress?: number;
  /** Callback cuando se cierra (después de éxito/error) */
  onClose?: () => void;
}

/** Círculo SVG con progreso animado */
function CircularProgress({ percent, size = 80 }: { percent: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={6}
        className="text-[var(--color-dashboard-border)]"
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        className="text-[var(--color-brand-500)] transition-[stroke-dashoffset] duration-300 ease-out"
      />
    </svg>
  );
}

export function FullScreenLoader({ state, message, detail, progress, onClose }: FullScreenLoaderProps) {
  // Auto-animate progress when no real value is provided
  const [autoPercent, setAutoPercent] = useState(10);

  useEffect(() => {
    if (state !== "loading" || progress !== undefined) return;
    setAutoPercent(10);
    // Step to 70% quickly, then slow down approaching 90%
    const steps: [number, number][] = [[30, 600], [50, 900], [65, 1200], [75, 1600], [85, 2400], [90, 4000]];
    const timers = steps.map(([pct, delay]) =>
      setTimeout(() => setAutoPercent(pct), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [state, progress]);

  // When loading completes with success/error, jump to 100
  useEffect(() => {
    if (state === "success" || state === "error") setAutoPercent(100);
  }, [state]);

  if (state === "idle") return null;

  const displayPercent = progress !== undefined ? Math.min(100, Math.max(0, progress)) : autoPercent;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-live="polite">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={state !== "loading" ? onClose : undefined}
      />

      <div className="relative w-full max-w-sm rounded-2xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] shadow-2xl p-8 text-center">

        {/* Circular progress / status icon */}
        <div className="flex justify-center mb-4">
          {state === "loading" && (
            <div className="relative w-20 h-20 flex items-center justify-center">
              <CircularProgress percent={displayPercent} size={80} />
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[var(--color-brand-500)]">
                {displayPercent}%
              </span>
            </div>
          )}
          {state === "success" && (
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
              <CheckCircle2 size={36} className="text-green-500" />
            </div>
          )}
          {state === "error" && (
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle size={36} className="text-red-500" />
            </div>
          )}
        </div>

        {/* Message */}
        <h3 className={`text-lg font-bold mb-1 ${
          state === "loading" ? "text-[var(--color-text-primary)]" :
          state === "success" ? "text-green-500" : "text-red-500"
        }`}>
          {message || (
            state === "loading" ? "Procesando..." :
            state === "success" ? "¡Operación Exitosa!" :
            "Error en la Operación"
          )}
        </h3>

        {detail && (
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{detail}</p>
        )}

        {/* Close button for success/error */}
        {state !== "loading" && onClose && (
          <button
            onClick={onClose}
            className={`mt-5 px-6 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${
              state === "success"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {state === "success" ? "Continuar" : "Cerrar"}
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes scale-in {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
