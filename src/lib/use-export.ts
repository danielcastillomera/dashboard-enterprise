"use client";

import { useRef, useCallback } from "react";
import { useToast } from "@/components/ui";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";

/* ============================================
   useExport HOOK — ENTERPRISE
   Estándar: Stripe, Shopify, Vercel
   
   Integra exportación con Toast Notifications:
   - Loading: "Generando archivo..." con cancelar
   - Success: "Archivo generado exitosamente!"
   - Error: "Error al generar el archivo"
   - Cancel: "Exportación cancelada"
   ============================================ */

export function useExport() {
  const { addToast, updateToast, removeToast } = useToast();
  const cancelledRef = useRef(false);

  const handleExportCSV = useCallback(
    (data: Record<string, unknown>[], columns: { key: string; header: string }[], filename: string) => {
      cancelledRef.current = false;

      const toastId = addToast({
        message: "Generando CSV...",
        variant: "loading",
        onCancel: () => {
          cancelledRef.current = true;
          updateToast(toastId, { message: "Exportación cancelada", variant: "error", duration: 3000 });
        },
      });

      // Simular pequeño delay para que se vea el loading (operación es instantánea)
      setTimeout(() => {
        if (cancelledRef.current) return;
        try {
          exportToCSV(data, columns, filename);
          updateToast(toastId, { message: "¡Archivo CSV generado exitosamente!", variant: "success" });
        } catch {
          updateToast(toastId, { message: "Error al generar el archivo CSV", variant: "error" });
        }
      }, 600);
    },
    [addToast, updateToast]
  );

  const handleExportPDF = useCallback(
    async (data: Record<string, unknown>[], columns: { key: string; header: string }[], title: string, filename: string) => {
      cancelledRef.current = false;

      const toastId = addToast({
        message: "Generando PDF...",
        variant: "loading",
        onCancel: () => {
          cancelledRef.current = true;
          updateToast(toastId, { message: "Exportación cancelada", variant: "error", duration: 3000 });
        },
      });

      try {
        // Pequeño delay para UX (dejar ver el loading)
        await new Promise((r) => setTimeout(r, 400));
        if (cancelledRef.current) return;

        await exportToPDF(data, columns, title, filename);

        if (cancelledRef.current) return;
        updateToast(toastId, { message: "¡Archivo PDF generado exitosamente!", variant: "success" });
      } catch {
        if (!cancelledRef.current) {
          updateToast(toastId, { message: "Error al generar el archivo PDF", variant: "error" });
        }
      }
    },
    [addToast, updateToast]
  );

  return { handleExportCSV, handleExportPDF, addToast, removeToast, updateToast };
}
