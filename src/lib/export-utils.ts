/* ============================================
   UTILIDADES DE EXPORTACIÓN — PDF & CSV
   Estándar enterprise: Stripe, Shopify
   
   - CSV: Nativo con BOM para Excel
   - PDF: jsPDF + jspdf-autotable
   ============================================ */

/** Exportar datos a CSV con compatibilidad Excel (UTF-8 BOM) */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: string; header: string }[],
  filename: string
): void {
  if (data.length === 0) return;

  const BOM = "\uFEFF"; // UTF-8 BOM para Excel
  const headers = columns.map((c) => `"${c.header}"`).join(",");
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const val = row[col.key];
        const str = val instanceof Date
          ? val.toLocaleDateString("es-EC")
          : String(val ?? "");
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  const csv = BOM + [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
}

/** Exportar datos a PDF con jsPDF */
export async function exportToPDF<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: string; header: string }[],
  title: string,
  filename: string
): Promise<void> {
  if (data.length === 0) return;

  // Importar dinámicamente para no afectar el bundle
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();

  // Título
  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text(title, 14, 20);

  // Fecha de generación
  doc.setFontSize(9);
  doc.setTextColor(128);
  doc.text(
    `Generado: ${new Date().toLocaleDateString("es-EC")} ${new Date().toLocaleTimeString("es-EC")}`,
    14,
    28
  );

  // Tabla
  const head = [columns.map((c) => c.header)];
  const body = data.map((row) =>
    columns.map((col) => {
      const val = row[col.key];
      return val instanceof Date
        ? val.toLocaleDateString("es-EC")
        : String(val ?? "");
    })
  );

  autoTable(doc, {
    head,
    body,
    startY: 34,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { left: 14, right: 14 },
  });

  // Total de registros
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = ((doc as any).lastAutoTable?.finalY as number) ?? 40;
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Total de registros: ${data.length}`, 14, finalY + 10);

  doc.save(`${filename}.pdf`);
}

/** Helper: descargar blob como archivo */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
