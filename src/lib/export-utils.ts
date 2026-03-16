/* ============================================
   UTILIDADES DE EXPORTACIÓN — PDF & CSV
   Estándar enterprise: Stripe, Shopify
   
   - CSV: Nativo con BOM para Excel
   - PDF: jsPDF + jspdf-autotable con cabecera empresarial
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

interface PDFOptions {
  /** URL del logo empresarial (base64 o URL pública) */
  logoUrl?: string;
  /** Nombre de la empresa */
  companyName?: string;
  /** Detalles de la empresa (RUC, dirección, etc.) */
  companyDetails?: string;
  /** Color principal de la marca en formato [R, G, B] (default: dorado) */
  brandColor?: [number, number, number];
}

/** Exportar datos a PDF con jsPDF — cabecera empresarial profesional */
export async function exportToPDF<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: string; header: string }[],
  title: string,
  filename: string,
  opts: PDFOptions = {}
): Promise<void> {
  if (data.length === 0) return;

  // Importar dinámicamente para no afectar el bundle
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const brandColor: [number, number, number] = opts.brandColor ?? [245, 158, 11];
  const darkColor: [number, number, number] = [30, 41, 59];

  // ---- HEADER BAND ----
  doc.setFillColor(...darkColor);
  doc.rect(0, 0, pageW, 28, "F");

  // Company name
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(opts.companyName || "Dashboard Enterprise", margin, 12);

  // Company details
  if (opts.companyDetails) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(opts.companyDetails, margin, 19);
  }

  // Brand accent stripe
  doc.setFillColor(...brandColor);
  doc.rect(0, 28, pageW, 3, "F");

  // ---- DOCUMENT TITLE ----
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkColor);
  doc.text(title, margin, 44);

  // Generated date
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  const genDate = `Generado: ${new Date().toLocaleDateString("es-EC")} ${new Date().toLocaleTimeString("es-EC")}`;
  doc.text(genDate, margin, 51);

  // ---- TABLE ----
  const head = [columns.map((c) => c.header)];
  const body = data.map((row) =>
    columns.map((col) => {
      const val = row[col.key];
      return val instanceof Date
        ? val.toLocaleDateString("es-EC")
        : String(val ?? "");
    })
  );

  // Track total pages as the table builds (avoids internal API access)
  let totalPagesCount = 1;

  autoTable(doc, {
    head,
    body,
    startY: 56,
    styles: { fontSize: 8, cellPadding: 3, textColor: darkColor },
    headStyles: { fillColor: darkColor, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {},
    margin: { left: margin, right: margin },
    didDrawPage: (hookData) => {
      // ---- PAGE FOOTER ----
      const pageNum = hookData.pageNumber;
      if (pageNum > totalPagesCount) totalPagesCount = pageNum;

      // Footer line
      doc.setDrawColor(...brandColor);
      doc.setLineWidth(0.5);
      doc.line(margin, pageH - 14, pageW - margin, pageH - 14);

      // Footer text
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.text(
        opts.companyName ? `${opts.companyName} · ${new Date().toLocaleDateString("es-EC")}` : new Date().toLocaleDateString("es-EC"),
        margin,
        pageH - 8
      );
      // Note: total page count shown as tracked value
      doc.text(
        `Página ${pageNum}`,
        pageW - margin,
        pageH - 8,
        { align: "right" }
      );
    },
  });

  // ---- RECORD COUNT ----
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = ((doc as any).lastAutoTable?.finalY as number) ?? 56;
  if (finalY + 16 < pageH - 20) {
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Total de registros: ${data.length}`, margin, finalY + 10);
  }

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

/** Exportar datos a Excel (.xlsx) con SheetJS */
export async function exportToXLSX<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: string; header: string }[],
  filename: string,
  sheetName = "Datos"
): Promise<void> {
  if (data.length === 0) return;
  const XLSX = await import("xlsx");
  const rows = data.map((row) =>
    Object.fromEntries(
      columns.map((col) => {
        const val = row[col.key];
        const str = val instanceof Date ? val.toLocaleDateString("es-EC") : (val ?? "");
        return [col.header, str];
      })
    )
  );
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = columns.map((col) => ({
    wch: Math.min(Math.max(col.header.length, ...data.map((r) => String(r[col.key] ?? "").length)) + 4, 40),
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

