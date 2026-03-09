import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { getCurrentTenantId } = await import("@/lib/db/get-tenant");
    const { prisma } = await import("@/lib/prisma");
    const tenantId = await getCurrentTenantId();

    const invoice = await prisma.invoice.findFirst({
      where: { id, tenantId },
      include: { customer: true, items: { orderBy: { orden: "asc" } }, businessProfile: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
    }

    const url = new URL(_req.url);
    const format = url.searchParams.get("format");

    // --- XML Download ---
    if (format === "xml") {
      const xml = invoice.xmlGenerado || "<factura><error>XML no generado</error></factura>";
      return new NextResponse(xml, {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Content-Disposition": `attachment; filename="factura-${invoice.invoiceNumber}.xml"`,
        },
      });
    }

    // --- PDF Download (RIDE format) ---
    if (format === "pdf") {
      const { generateRidePDF } = await import("@/lib/billing/ride-pdf");
      const bp = invoice.businessProfile;
      const cust = invoice.customer;

      const pdfBuffer = await generateRidePDF({
        companyName: bp?.razonSocial || "EMPRESA",
        tradeName: bp?.nombreComercial || undefined,
        ruc: bp?.ruc || "0000000000000",
        mainAddress: bp?.direccionMatriz || "",
        branchAddress: bp?.direccionSucursal || undefined,
        specialTaxpayer: bp?.contribuyenteEspecial || undefined,
        keepAccounting: bp?.obligadoContabilidad ?? false,
        rimpe: bp?.regimenRimpe ?? false,
        invoiceNumber: invoice.invoiceNumber,
        claveAcceso: invoice.claveAcceso || "N/A",
        issueDate: new Date(invoice.fechaEmision).toLocaleDateString("es-EC"),
        environment: invoice.ambiente || "PRUEBAS",
        emissionType: invoice.tipoEmision || "NORMAL",
        customerName: cust?.razonSocial || "",
        customerId: cust?.identificacion || "",
        customerIdType: cust?.tipoIdentificacion || "05",
        customerAddress: cust?.direccion || undefined,
        customerPhone: cust?.telefono || cust?.celular || undefined,
        customerEmail: cust?.email || undefined,
        items: invoice.items.map((it) => ({
          code: it.codigoPrincipal,
          description: it.descripcion,
          quantity: it.cantidad,
          unitPrice: it.precioUnitario,
          discount: it.descuento,
          subtotal: it.precioTotalSinImpuesto,
        })),
        subtotal12: invoice.subtotal15,
        subtotal0: invoice.subtotal0,
        subtotalNoTax: invoice.subtotalNoObjeto,
        subtotalExempt: invoice.subtotalExento,
        totalDiscount: invoice.totalDescuento,
        iva: invoice.iva15,
        total: invoice.importeTotal,
        paymentMethod: invoice.formaPagoDescripcion || "EFECTIVO",
        paymentAmount: invoice.importeTotal,
      });

      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="factura-${invoice.invoiceNumber}.pdf"`,
        },
      });
    }

    // --- JSON Detail ---
    return NextResponse.json(invoice);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Invoice API error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
