"use client";

import { Loader2, CheckCircle2, XCircle } from "lucide-react";

/* ============================================
   FULL SCREEN LOADER
   
   Overlay centrado en el dashboard para mostrar
   estados de carga, éxito o error durante
   operaciones críticas.
   ============================================ */

interface FullScreenLoaderProps {
  /** Estado actual */
  state: "loading" | "success" | "error" | "idle";
  /** Mensaje principal */
  message?: string;
  /** Submensaje (opcional) */
  detail?: string;
  /** Callback cuando se cierra (después de éxito/error) */
  onClose?: () => void;
}

export function FullScreenLoader({ state, message, detail, onClose }: FullScreenLoaderProps) {
  if (state === "idle") return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={state !== "loading" ? onClose : undefined} />
      
      <div className="relative w-full max-w-sm rounded-2xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] shadow-2xl p-8 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          {state === "loading" && (
            <div className="w-16 h-16 rounded-full bg-[var(--color-brand-500)]/10 flex items-center justify-center">
              <Loader2 size={32} className="text-[var(--color-brand-500)] animate-spin" />
            </div>
          )}
          {state === "success" && (
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
          )}
          {state === "error" && (
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle size={32} className="text-red-500" />
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
          <p className="text-sm text-[var(--color-text-secondary)]">{detail}</p>
        )}

        {/* Loading bar */}
        {state === "loading" && (
          <div className="mt-4 h-1 w-full rounded-full bg-[var(--color-dashboard-border)] overflow-hidden">
            <div className="h-full bg-[var(--color-brand-500)] rounded-full animate-[loading-bar_1.5s_ease-in-out_infinite]"
              style={{ width: "40%" }} />
          </div>
        )}

        {/* Close button for success/error */}
        {state !== "loading" && onClose && (
          <button
            onClick={onClose}
            className={`mt-4 px-6 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${
              state === "success"
                ? "bg-green-500 hover:bg-green-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {state === "success" ? "Continuar" : "Cerrar"}
          </button>
        )}
      </div>

      {/* CSS animation for loading bar */}
      <style jsx>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes scale-in {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
