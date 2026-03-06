"use client";

import { useEffect, useCallback, useState, createContext, useContext, type ReactNode } from "react";
import { AlertTriangle, Check, X } from "lucide-react";

/* ============================================
   UNSAVED CHANGES GUARD

   Previene navegación cuando hay cambios sin guardar.
   Muestra un diálogo de confirmación centrado.

   Uso:
     const { setDirty, clearDirty } = useUnsavedGuard();
     // Cuando el usuario empieza a editar:
     setDirty();
     // Cuando guarda exitosamente:
     clearDirty();
   ============================================ */

interface GuardContextType {
  isDirty: boolean;
  setDirty: () => void;
  clearDirty: () => void;
  /** Call before programmatic navigation — returns true if safe to proceed */
  confirmLeave: () => Promise<boolean>;
}

const GuardContext = createContext<GuardContextType | null>(null);

export function useUnsavedGuard(): GuardContextType {
  const ctx = useContext(GuardContext);
  if (!ctx) throw new Error("useUnsavedGuard must be used within UnsavedGuardProvider");
  return ctx;
}

interface ConfirmState {
  visible: boolean;
  resolve: ((value: boolean) => void) | null;
}

export function UnsavedGuardProvider({ children }: { children: ReactNode }) {
  const [isDirty, setIsDirty] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>({ visible: false, resolve: null });

  const setDirtyFn = useCallback(() => setIsDirty(true), []);
  const clearDirtyFn = useCallback(() => setIsDirty(false), []);

  // Browser beforeunload — catches tab close / refresh
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const confirmLeave = useCallback((): Promise<boolean> => {
    if (!isDirty) return Promise.resolve(true);
    return new Promise<boolean>((resolve) => {
      setConfirm({ visible: true, resolve });
    });
  }, [isDirty]);

  const handleChoice = (proceed: boolean) => {
    if (confirm.resolve) confirm.resolve(proceed);
    if (proceed) setIsDirty(false);
    setConfirm({ visible: false, resolve: null });
  };

  return (
    <GuardContext.Provider value={{ isDirty, setDirty: setDirtyFn, clearDirty: clearDirtyFn, confirmLeave }}>
      {children}

      {/* Confirmation Dialog */}
      {confirm.visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="alertdialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-2xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] shadow-2xl p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <AlertTriangle size={32} className="text-yellow-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
              ¿Desea salir sin guardar?
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              Tiene cambios sin guardar. Si sale ahora, perderá toda la información ingresada.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => handleChoice(false)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                <Check size={16} /> Continuar editando
              </button>
              <button
                onClick={() => handleChoice(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                <X size={16} /> Salir sin guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </GuardContext.Provider>
  );
}
