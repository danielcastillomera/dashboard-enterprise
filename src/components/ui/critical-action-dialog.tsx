"use client";

import { useState, useCallback } from "react";
import { AlertTriangle, X } from "lucide-react";

/* ============================================
   CRITICAL ACTION DIALOG
   
   Para operaciones críticas (eliminar, anular):
   - Motivo obligatorio (max 100 caracteres)
   - Operador responsable (dropdown)
   - Registro en audit log (localStorage)
   
   Desarrollado por Daniel Fernando Castillo Mera
   ============================================ */

const AUDIT_STORAGE_KEY = "dashboard_audit_log";

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  targetType: string;
  targetId: string;
  targetName: string;
  reason: string;
  operator: string;
}

interface CriticalActionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string, operator: string) => void;
  title: string;
  description: string;
  actionLabel?: string;
  actionType: string;
  targetType: string;
  targetId: string;
  targetName: string;
}

const OPERATORS = [
  "Administrador",
  "Operador 1",
  "Operador 2",
  "Supervisor",
];

export function CriticalActionDialog({
  open, onClose, onConfirm, title, description, actionLabel = "Confirmar",
  actionType, targetType, targetId, targetName,
}: CriticalActionDialogProps) {
  const [reason, setReason] = useState("");
  const [operator, setOperator] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = useCallback(() => {
    if (!reason.trim()) { setError("El motivo es obligatorio"); return; }
    if (reason.trim().length < 5) { setError("El motivo debe tener al menos 5 caracteres"); return; }
    if (!operator) { setError("Seleccione un operador"); return; }

    // Save to audit log
    const entry: AuditEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action: actionType,
      targetType,
      targetId,
      targetName,
      reason: reason.trim(),
      operator,
    };

    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      const log: AuditEntry[] = stored ? JSON.parse(stored) : [];
      log.unshift(entry);
      // Keep last 500 entries
      if (log.length > 500) log.length = 500;
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(log));
    } catch { /* */ }

    onConfirm(reason.trim(), operator);
    setReason("");
    setOperator("");
    setError("");
  }, [reason, operator, actionType, targetType, targetId, targetName, onConfirm]);

  const handleClose = () => {
    setReason("");
    setOperator("");
    setError("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-dashboard-surface)] rounded-2xl border border-[var(--color-dashboard-border)] shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-dashboard-border)]">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">{title}</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Operación crítica — requiere justificación</p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-[var(--color-dashboard-surface-hover)] text-[var(--color-text-muted)]" title="Cancelar">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">{description}</p>

          {/* Operator */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
              Operador responsable <span className="text-red-500">*</span>
            </label>
            <select
              value={operator}
              onChange={(e) => { setOperator(e.target.value); setError(""); }}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-dashboard-input)] border border-[var(--color-dashboard-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
            >
              <option value="">Seleccione un operador</option>
              {OPERATORS.map((op) => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
              Motivo de la operación <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => { if (e.target.value.length <= 100) { setReason(e.target.value); setError(""); } }}
              placeholder="Describa brevemente el motivo..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-dashboard-input)] border border-[var(--color-dashboard-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none"
            />
            <div className="flex justify-between mt-1">
              {error && <p className="text-xs text-red-500">{error}</p>}
              <p className="text-[10px] text-[var(--color-text-muted)] ml-auto">{reason.length}/100</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--color-dashboard-border)] bg-[var(--color-dashboard-bg)]/50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-xs font-medium text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-dashboard-surface-hover)] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Get audit log from localStorage */
export function getAuditLog(): AuditEntry[] {
  try {
    const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/** Clear audit log */
export function clearAuditLog(): void {
  try { localStorage.removeItem(AUDIT_STORAGE_KEY); } catch { /* */ }
}
