"use client";

import { useEffect, useState, useRef } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

/* ============================================
   FULL SCREEN LOADER

   Estado visual:  circle → 100% → icon (success/error)
   Garantiza que el usuario SIEMPRE ve el 100%
   antes de ver el resultado final.
   ============================================ */

interface FullScreenLoaderProps {
  state: "loading" | "success" | "error" | "idle";
  message?: string;
  detail?: string;
  progress?: number;
  onClose?: () => void;
}

function CircularProgress({ percent, size = 80 }: { percent: number; size?: number }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={6} className="text-[var(--color-dashboard-border)]" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={6} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} className="text-[var(--color-brand-500)] transition-[stroke-dashoffset] duration-200 ease-out" />
    </svg>
  );
}

// Visual state machine: "circle" shows progress, "result" shows icon
type Phase = "circle" | "result";

export function FullScreenLoader({ state, message, detail, progress, onClose }: FullScreenLoaderProps) {
  const [percent, setPercent] = useState(0);
  const [phase, setPhase] = useState<Phase>("circle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animate progress from 0 to ~95 while loading
  useEffect(() => {
    if (state === "loading") {
      setPercent(0);
      setPhase("circle");
      let p = 0;
      intervalRef.current = setInterval(() => {
        p += p < 50 ? 8 : p < 80 ? 4 : p < 95 ? 1 : 0;
        if (p > 95) p = 95;
        setPercent(p);
      }, 100);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
  }, [state]);

  // When operation finishes: jump to 100%, pause, then show result
  useEffect(() => {
    if (state === "success" || state === "error") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPercent(100);
      const t = setTimeout(() => setPhase("result"), 500);
      return () => clearTimeout(t);
    }
  }, [state]);

  // Use externally provided progress if available
  const displayPercent = progress !== undefined ? Math.min(100, Math.max(0, progress)) : percent;

  if (state === "idle") return null;

  const isSuccess = state === "success";
  const isError = state === "error";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-live="polite">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={phase === "result" ? onClose : undefined} />

      <div className="relative w-full max-w-sm rounded-2xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] shadow-2xl p-8 text-center">
        <div className="flex justify-center mb-4">
          {phase === "circle" && (
            <div className="relative w-20 h-20 flex items-center justify-center">
              <CircularProgress percent={displayPercent} size={80} />
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[var(--color-brand-500)]">
                {Math.round(displayPercent)}%
              </span>
            </div>
          )}
          {phase === "result" && isSuccess && (
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
              <CheckCircle2 size={36} className="text-green-500" />
            </div>
          )}
          {phase === "result" && isError && (
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
              <XCircle size={36} className="text-red-500" />
            </div>
          )}
        </div>

        <h3 className={`text-lg font-bold mb-1 ${
          phase === "circle" ? "text-[var(--color-text-primary)]" :
          isSuccess ? "text-green-500" : "text-red-500"
        }`}>
          {message || (
            phase === "circle" ? "Procesando..." :
            isSuccess ? "¡Operación Exitosa!" :
            "Error en la Operación"
          )}
        </h3>

        {detail && <p className="text-sm text-[var(--color-text-muted)] mt-1">{detail}</p>}

        {phase === "result" && onClose && (
          <button
            onClick={onClose}
            className={`mt-5 px-6 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${
              isSuccess ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isSuccess ? "Continuar" : "Cerrar"}
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
