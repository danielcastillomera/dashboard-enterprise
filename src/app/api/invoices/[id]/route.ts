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
      include: { customer: true, items: true, businessProfile: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
    }

    const url = new URL(_req.url);
    const format = url.searchParams.get("format");

    // Download XML file
    if (format === "xml") {
      const xml = invoice.xmlGenerado || "<factura><error>XML no generado</error></factura>";
      return new NextResponse(xml, {
        headers: {
          "Content-Type": "application/xml",
          "Content-Disposition": `attachment; filename="factura-${invoice.invoiceNumber}.xml"`,
        },
      });
    }

    // Download as simple text receipt (PDF placeholder for now)
    if (format === "pdf") {
      const bp = invoice.businessProfile;
      const lines = [
        bp?.razonSocial || "EMPRESA",
        bp?.ruc ? `RUC: ${bp.ruc}` : "",
        bp?.direccionMatriz || "",
        "",
        "FACTURA ELECTRÓNICA",
        `No.: ${invoice.invoiceNumber}`,
        `Fecha: ${new Date(invoice.fechaEmision).toLocaleDateString("es-EC")}`,
        `Clave de Acceso: ${invoice.claveAcceso || "N/A"}`,
        "",
        `Cliente: ${invoice.customer?.razonSocial || ""}`,
        `Identificación: ${invoice.customer?.identificacion || ""}`,
        `Dirección: ${invoice.customer?.direccion || ""}`,
        "",
        "DETALLE:",
        "-".repeat(60),
        ...invoice.items.map(it =>
          `${it.descripcion}  |  ${it.cantidad} x $${it.precioUnitario.toFixed(2)}  =  $${it.precioTotalSinImpuesto.toFixed(2)}`
        ),
        "-".repeat(60),
        `SUBTOTAL: $${invoice.subtotalSinImpuestos.toFixed(2)}`,
        `IVA 15%:  $${invoice.iva15.toFixed(2)}`,
        `TOTAL:    $${invoice.importeTotal.toFixed(2)}`,
        "",
        `Forma de Pago: ${invoice.formaPagoDescripcion || "EFECTIVO"}`,
      ].filter(Boolean).join("\n");

      return new NextResponse(lines, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="factura-${invoice.invoiceNumber}.txt"`,
        },
      });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
