"use client";

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Loader2, Info } from "lucide-react";

/* ============================================
   TOAST NOTIFICATION SYSTEM — ENTERPRISE
   Estándar: Stripe, Shopify, Vercel, Linear
   
   Características:
   - 4 variantes: success, error, loading, info
   - Auto-dismiss configurable
   - Botón cancelar en loading
   - Animaciones de entrada/salida
   - Accesible (role="alert", aria-live)
   - Apilable (múltiples toasts)
   ============================================ */

export type ToastVariant = "success" | "error" | "loading" | "info";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number; // ms, 0 = sin auto-dismiss
  onCancel?: () => void;
  dismissing?: boolean;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<Omit<Toast, "id">>) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de ToastProvider");
  return ctx;
}

let toastCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    // Primero marcar como dismissing para animación
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, dismissing: true } : t));
    // Después remover
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${++toastCounter}`;
    const newToast: Toast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss (loading no se auto-cierra)
    const duration = toast.duration ?? (toast.variant === "loading" ? 0 : 4000);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }

    return id;
  }, [removeToast]);

  const updateToast = useCallback((id: string, updates: Partial<Omit<Toast, "id">>) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, ...updates } : t));

    // Si se actualiza a success/error, auto-dismiss
    if (updates.variant && updates.variant !== "loading") {
      const duration = updates.duration ?? 4000;
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, updateToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

/* ============================================
   TOAST CONTAINER — Renderiza los toasts
   Posición: top-right (estándar Stripe/Vercel)
   ============================================ */

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-label="Notificaciones"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

/* ============================================
   TOAST ITEM — Un toast individual
   ============================================ */

const iconMap: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle size={18} />,
  error: <AlertCircle size={18} />,
  loading: <Loader2 size={18} className="animate-spin" />,
  info: <Info size={18} />,
};

const colorMap: Record<ToastVariant, { bg: string; icon: string; border: string }> = {
  success: {
    bg: "bg-[var(--color-dashboard-surface)]",
    icon: "text-green-500",
    border: "border-green-500/40",
  },
  error: {
    bg: "bg-[var(--color-dashboard-surface)]",
    icon: "text-red-500",
    border: "border-red-500/40",
  },
  loading: {
    bg: "bg-[var(--color-dashboard-surface)]",
    icon: "text-blue-500",
    border: "border-blue-500/40",
  },
  info: {
    bg: "bg-[var(--color-dashboard-surface)]",
    icon: "text-[var(--color-text-muted)]",
    border: "border-[var(--color-dashboard-border)]",
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const colors = colorMap[toast.variant];

  useEffect(() => {
    // Trigger entrada con delay para animación
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function handleCancel() {
    if (toast.onCancel) toast.onCancel();
    onDismiss(toast.id);
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm
        transition-all duration-300 ease-out
        ${colors.bg} ${colors.border}
        ${visible && !toast.dismissing ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      {/* Icono */}
      <span className={`mt-0.5 flex-shrink-0 ${colors.icon}`} aria-hidden="true">
        {iconMap[toast.variant]}
      </span>

      {/* Mensaje */}
      <p className="flex-1 text-sm font-medium text-[var(--color-text-primary)] leading-snug">
        {toast.message}
      </p>

      {/* Botones */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Cancelar — solo en loading */}
        {toast.variant === "loading" && toast.onCancel && (
          <button
            onClick={handleCancel}
            className="px-2 py-1 rounded-md text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
          >
            Cancelar
          </button>
        )}

        {/* Cerrar */}
        <button
          onClick={() => {
            if (toast.variant === "loading" && toast.onCancel) toast.onCancel();
            onDismiss(toast.id);
          }}
          className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)] transition-colors"
          aria-label="Cerrar notificación"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
