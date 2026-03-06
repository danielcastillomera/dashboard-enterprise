/* ============================================
   SEND INVOICE EMAIL
   
   Envía la factura electrónica al cliente
   por email usando Resend.
   ============================================ */

import { resend, EMAIL_FROM } from "./resend-client";
import { buildInvoiceEmailHtml, buildInvoiceEmailText } from "./templates/invoice-email";

interface SendInvoiceOptions {
  invoice: {
    invoiceNumber: string;
    claveAcceso?: string | null;
    fechaEmision: Date | string;
    subtotalSinImpuestos: number;
    iva15: number;
    importeTotal: number;
    items: {
      descripcion: string;
      cantidad: number;
      precioUnitario: number;
      precioTotalSinImpuesto: number;
    }[];
    customer: {
      razonSocial: string;
      email: string;
    };
  };
  businessProfile: {
    razonSocial: string;
    ruc: string;
    email?: string | null;
  };
}

/**
 * Envía la factura electrónica por email al cliente.
 * Retorna true si se envió exitosamente, false en caso de error.
 */
export async function sendInvoiceEmail(opts: SendInvoiceOptions): Promise<boolean> {
  const { invoice, businessProfile } = opts;

  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_placeholder") {
    console.warn("⚠️  RESEND_API_KEY no configurado. Saltando envío de email.");
    return false;
  }

  const toEmail = invoice.customer.email;
  if (!toEmail) {
    console.warn("⚠️  Cliente sin email. No se puede enviar factura.");
    return false;
  }

  const fechaStr =
    invoice.fechaEmision instanceof Date
      ? invoice.fechaEmision.toLocaleDateString("es-EC")
      : new Date(invoice.fechaEmision).toLocaleDateString("es-EC");

  const emailParams = {
    invoiceNumber: invoice.invoiceNumber,
    clientName: invoice.customer.razonSocial,
    clientEmail: toEmail,
    companyName: businessProfile.razonSocial,
    companyRuc: businessProfile.ruc,
    fechaEmision: fechaStr,
    subtotal: invoice.subtotalSinImpuestos,
    iva: invoice.iva15,
    total: invoice.importeTotal,
    claveAcceso: invoice.claveAcceso ?? undefined,
    items: invoice.items.map((it) => ({
      descripcion: it.descripcion,
      cantidad: it.cantidad,
      precioUnitario: it.precioUnitario,
      subtotal: it.precioTotalSinImpuesto,
    })),
  };

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: toEmail,
      subject: `Factura ${invoice.invoiceNumber} — ${businessProfile.razonSocial}`,
      html: buildInvoiceEmailHtml(emailParams),
      text: buildInvoiceEmailText(emailParams),
    });

    if (error) {
      console.error("Error enviando factura por email:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error enviando factura por email:", err);
    return false;
  }
}
