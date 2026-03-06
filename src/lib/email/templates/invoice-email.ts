/* ============================================
   PLANTILLA DE EMAIL — FACTURA ELECTRÓNICA
   
   HTML profesional para envío de facturas.
   Compatible con la mayoría de clientes de email.
   ============================================ */

interface InvoiceEmailProps {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  companyName: string;
  companyRuc: string;
  fechaEmision: string;
  subtotal: number;
  iva: number;
  total: number;
  items: { descripcion: string; cantidad: number; precioUnitario: number; subtotal: number }[];
  claveAcceso?: string;
  pdfUrl?: string;
}

export function buildInvoiceEmailHtml(p: InvoiceEmailProps): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(n);

  const itemsHtml = p.items
    .map(
      (it) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${it.descripcion}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${it.cantidad}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${fmt(it.precioUnitario)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">${fmt(it.subtotal)}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factura ${p.invoiceNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,.07);">

          <!-- Header -->
          <tr>
            <td style="background:#1e293b;padding:28px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;">${p.companyName}</h1>
              <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">RUC: ${p.companyRuc}</p>
            </td>
          </tr>

          <!-- Invoice badge -->
          <tr>
            <td style="padding:24px 32px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h2 style="margin:0;font-size:18px;color:#1e293b;">Factura Electrónica</h2>
                    <p style="margin:4px 0 0;color:#64748b;font-size:13px;">
                      N° <strong style="color:#f59e0b;">${p.invoiceNumber}</strong> &nbsp;|&nbsp; ${p.fechaEmision}
                    </p>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;background:#dcfce7;color:#16a34a;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700;">EMITIDA</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Client info -->
          <tr>
            <td style="padding:16px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;">Facturado a</p>
                    <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#1e293b;">${p.clientName}</p>
                    <p style="margin:2px 0 0;font-size:13px;color:#64748b;">${p.clientEmail}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items table -->
          <tr>
            <td style="padding:0 32px 8px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
                <thead>
                  <tr style="background:#1e293b;">
                    <th style="padding:10px 12px;text-align:left;font-size:12px;color:#fff;">Descripción</th>
                    <th style="padding:10px 12px;text-align:center;font-size:12px;color:#fff;">Cant.</th>
                    <th style="padding:10px 12px;text-align:right;font-size:12px;color:#fff;">P. Unit.</th>
                    <th style="padding:10px 12px;text-align:right;font-size:12px;color:#fff;">Subtotal</th>
                  </tr>
                </thead>
                <tbody style="font-size:13px;color:#374151;">
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding:8px 32px 24px;">
              <table align="right" cellpadding="0" cellspacing="0" style="min-width:220px;">
                <tr>
                  <td style="padding:4px 12px;font-size:13px;color:#64748b;">Subtotal sin impuestos:</td>
                  <td style="padding:4px 12px;font-size:13px;text-align:right;">${fmt(p.subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:4px 12px;font-size:13px;color:#64748b;">IVA 15%:</td>
                  <td style="padding:4px 12px;font-size:13px;text-align:right;">${fmt(p.iva)}</td>
                </tr>
                <tr style="border-top:2px solid #1e293b;">
                  <td style="padding:8px 12px;font-size:15px;font-weight:700;color:#1e293b;">TOTAL:</td>
                  <td style="padding:8px 12px;font-size:15px;font-weight:700;color:#f59e0b;text-align:right;">${fmt(p.total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          ${p.claveAcceso ? `<!-- Clave de acceso -->
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;">Clave de acceso SRI</p>
              <p style="margin:0;font-size:10px;font-family:monospace;color:#64748b;word-break:break-all;">${p.claveAcceso}</p>
            </td>
          </tr>` : ""}

          ${p.pdfUrl ? `<!-- PDF link -->
          <tr>
            <td style="padding:0 32px 24px;text-align:center;">
              <a href="${p.pdfUrl}" style="display:inline-block;background:#f59e0b;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">
                📄 Descargar PDF
              </a>
            </td>
          </tr>` : ""}

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                Este comprobante electrónico fue generado por el sistema de facturación SRI Ecuador.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildInvoiceEmailText(p: InvoiceEmailProps): string {
  return [
    `FACTURA ELECTRÓNICA ${p.invoiceNumber}`,
    `${p.companyName} — RUC: ${p.companyRuc}`,
    `Fecha: ${p.fechaEmision}`,
    ``,
    `Cliente: ${p.clientName}`,
    ``,
    `DETALLE:`,
    ...p.items.map(i => `  ${i.descripcion} x${i.cantidad} = $${i.subtotal.toFixed(2)}`),
    ``,
    `Subtotal: $${p.subtotal.toFixed(2)}`,
    `IVA 15%: $${p.iva.toFixed(2)}`,
    `TOTAL: $${p.total.toFixed(2)}`,
    p.claveAcceso ? `\nClave de acceso: ${p.claveAcceso}` : "",
  ].join("\n");
}
