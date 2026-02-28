"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AlertTriangle, ArrowLeft, X } from "lucide-react";

/* ============================================
   OPERATION GUARD — Enterprise
   
   Bloquea la navegación cuando hay operaciones
   críticas en progreso (ventas, compras, edición
   de productos, etc.)
   ============================================ */

interface OperationGuardContextType {
  startCriticalOperation: (config: CriticalOperationConfig) => void;
  endCriticalOperation: () => void;
  isOperationActive: boolean;
  activeOperation: CriticalOperationConfig | null;
}

interface CriticalOperationConfig {
  operationName: string;
  returnPath: string;
  onCancel?: () => void;
}

const OperationGuardContext = createContext<OperationGuardContextType>({
  startCriticalOperation: () => {},
  endCriticalOperation: () => {},
  isOperationActive: false,
  activeOperation: null,
});

export function useOperationGuard() {
  return useContext(OperationGuardContext);
}

export function OperationGuardProvider({ children }: { children: ReactNode }) {
  const [activeOperation, setActiveOperation] = useState<CriticalOperationConfig | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const pathname = usePathname();

  // Refs to manually remove listeners before navigation
  const beforeUnloadRef = useRef<((e: BeforeUnloadEvent) => void) | null>(null);
  const clickHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);

  const startCriticalOperation = useCallback((config: CriticalOperationConfig) => {
    setActiveOperation(config);
  }, []);

  const endCriticalOperation = useCallback(() => {
    setActiveOperation(null);
    setShowBlockModal(false);
    setPendingHref(null);
  }, []);

  // Remove all listeners immediately (before React cleanup)
  const removeListeners = useCallback(() => {
    if (clickHandlerRef.current) {
      document.removeEventListener("click", clickHandlerRef.current, true);
      clickHandlerRef.current = null;
    }
    if (beforeUnloadRef.current) {
      window.removeEventListener("beforeunload", beforeUnloadRef.current);
      beforeUnloadRef.current = null;
    }
  }, []);

  // Interceptar navegación cuando hay operación activa
  useEffect(() => {
    if (!activeOperation) {
      removeListeners();
      return;
    }

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const link = target.closest("a[href]") as HTMLAnchorElement | null;
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http")) return;

      if (href !== activeOperation?.returnPath && href !== pathname) {
        e.preventDefault();
        e.stopPropagation();
        setPendingHref(href);
        setShowBlockModal(true);
      }
    }

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }

    clickHandlerRef.current = handleClick;
    beforeUnloadRef.current = handleBeforeUnload;

    document.addEventListener("click", handleClick, true);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      removeListeners();
    };
  }, [activeOperation, pathname, removeListeners]);

  function handleReturn() {
    setShowBlockModal(false);
    setPendingHref(null);
  }

  function handleCancelOperation() {
    // 1. Remove listeners FIRST (prevents browser beforeunload dialog)
    removeListeners();

    // 2. Call the cancel callback
    if (activeOperation?.onCancel) {
      activeOperation.onCancel();
    }

    // 3. Clear state
    setActiveOperation(null);
    setShowBlockModal(false);

    // 4. Navigate AFTER listeners are removed
    if (pendingHref) {
      const href = pendingHref;
      setPendingHref(null);
      // Use setTimeout to ensure state is fully cleared
      setTimeout(() => {
        window.location.href = href;
      }, 0);
    } else {
      setPendingHref(null);
    }
  }

  return (
    <OperationGuardContext.Provider
      value={{
        startCriticalOperation,
        endCriticalOperation,
        isOperationActive: activeOperation !== null,
        activeOperation,
      }}
    >
      {children}

      {/* Modal de bloqueo */}
      {showBlockModal && activeOperation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-2xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] shadow-2xl overflow-hidden">
            {/* Icon */}
            <div className="flex justify-center pt-8 pb-2">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle size={32} className="text-amber-500" />
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-2 text-center">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
                Operación en Proceso
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Tiene un proceso pendiente de{" "}
                <span className="font-semibold text-[var(--color-brand-500)]">
                  &ldquo;{activeOperation.operationName}&rdquo;
                </span>
                . No puede cambiar de sección hasta completar o cancelar esta operación.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 px-6 py-6">
              <button
                onClick={handleCancelOperation}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                <X size={16} />
                Cancelar Operación
              </button>
              <button
                onClick={handleReturn}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-green-500 hover:bg-green-600 transition-colors"
              >
                <ArrowLeft size={16} />
                Volver al Proceso
              </button>
            </div>
          </div>
        </div>
      )}
    </OperationGuardContext.Provider>
  );
}
