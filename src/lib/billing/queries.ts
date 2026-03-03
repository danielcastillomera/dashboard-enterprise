"use server";

import { prisma } from "@/lib/prisma";
import { generateClaveAcceso, formatInvoiceNumber, FORMAS_PAGO } from "@/lib/billing/clave-acceso";
import { generateInvoiceXML } from "@/lib/billing/xml-generator";

// ---- CUSTOMERS ----

export async function getCustomers(tenantId: string) {
  return prisma.customer.findMany({
    where: { tenantId, isActive: true },
    orderBy: { razonSocial: "asc" },
  });
}

export async function getCustomer(id: string) {
  return prisma.customer.findUnique({ where: { id } });
}

export async function createCustomer(tenantId: string, data: {
  tipoIdentificacion: string; identificacion: string; razonSocial: string;
  direccion: string; telefono?: string; celular: string; email: string;
}) {
  return prisma.customer.create({ data: { ...data, tenantId } });
}

export async function updateCustomer(id: string, data: {
  tipoIdentificacion?: string; identificacion?: string; razonSocial?: string;
  direccion?: string; telefono?: string; celular?: string; email?: string;
}) {
  return prisma.customer.update({ where: { id }, data });
}

export async function deleteCustomer(id: string) {
  return prisma.customer.update({ where: { id }, data: { isActive: false } });
}

// ---- BUSINESS PROFILE ----

export async function getBusinessProfile(tenantId: string) {
  return prisma.businessProfile.findUnique({ where: { tenantId } });
}

export async function upsertBusinessProfile(tenantId: string, data: {
  ruc: string; razonSocial: string; nombreComercial?: string;
  direccionMatriz: string; direccionSucursal?: string;
  telefono?: string; email?: string; website?: string; logoUrl?: string;
  ambiente?: string; obligadoContabilidad?: boolean;
  contribuyenteEspecial?: string; regimenRimpe?: boolean;
  ivaRate?: number; establishment?: string; emissionPoint?: string;
}) {
  return prisma.businessProfile.upsert({
    where: { tenantId },
    create: { ...data, tenantId },
    update: data,
  });
}

// ---- INVOICES ----

export async function getInvoices(tenantId: string) {
  return prisma.invoice.findMany({
    where: { tenantId },
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInvoice(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, items: true, businessProfile: true },
  });
}

export async function createInvoice(tenantId: string, data: {
  customerId: string;
  formaPago: string;
  items: {
    codigoPrincipal: string;
    codigoAuxiliar?: string;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
    ivaCode: string;
  }[];
  notes?: string;
  orderId?: string;
}) {
  return prisma.$transaction(async (tx) => {
    // Get business profile
    const bp = await tx.businessProfile.findUnique({ where: { tenantId } });
    if (!bp) throw new Error("Configure los datos de la empresa primero");

    // Get customer
    const customer = await tx.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) throw new Error("Cliente no encontrado");

    // Increment sequential (gapless)
    const updated = await tx.businessProfile.update({
      where: { tenantId },
      data: { currentSequential: { increment: 1 } },
    });
    const sequential = updated.currentSequential;
    const secuencial = String(sequential).padStart(9, "0");

    // Calculate line items
    const ivaRate = bp.ivaRate || 15;
    const processedItems = data.items.map((item, idx) => {
      const precioTotal = item.cantidad * item.precioUnitario - item.descuento;
      const itemIvaRate = item.ivaCode === "4" ? ivaRate : 0;
      const ivaValor = precioTotal * (itemIvaRate / 100);
      return {
        codigoPrincipal: item.codigoPrincipal,
        codigoAuxiliar: item.codigoAuxiliar || item.codigoPrincipal,
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        descuento: item.descuento,
        precioTotalSinImpuesto: precioTotal,
        ivaCode: item.ivaCode,
        ivaTarifa: itemIvaRate,
        ivaBaseImponible: precioTotal,
        ivaValor: Math.round(ivaValor * 100) / 100,
        orden: idx,
      };
    });

    // Calculate totals
    const subtotal15 = processedItems.filter(i => i.ivaCode === "4").reduce((s, i) => s + i.precioTotalSinImpuesto, 0);
    const subtotal0 = processedItems.filter(i => i.ivaCode === "0").reduce((s, i) => s + i.precioTotalSinImpuesto, 0);
    const subtotalNoObjeto = processedItems.filter(i => i.ivaCode === "6").reduce((s, i) => s + i.precioTotalSinImpuesto, 0);
    const subtotalExento = processedItems.filter(i => i.ivaCode === "7").reduce((s, i) => s + i.precioTotalSinImpuesto, 0);
    const subtotalSinImpuestos = subtotal15 + subtotal0 + subtotalNoObjeto + subtotalExento;
    const totalDescuento = processedItems.reduce((s, i) => s + i.descuento, 0);
    const iva15 = Math.round(processedItems.reduce((s, i) => s + i.ivaValor, 0) * 100) / 100;
    const importeTotal = Math.round((subtotalSinImpuestos + iva15) * 100) / 100;

    // Generate clave de acceso
    const claveAcceso = generateClaveAcceso({
      fecha: new Date(),
      tipoComprobante: "01",
      ruc: bp.ruc,
      ambiente: bp.ambiente,
      establecimiento: bp.establishment,
      puntoEmision: bp.emissionPoint,
      secuencial,
    });

    const invoiceNumber = formatInvoiceNumber(bp.establishment, bp.emissionPoint, sequential);
    const fechaEmision = new Date();
    const dd = String(fechaEmision.getDate()).padStart(2, "0");
    const mm = String(fechaEmision.getMonth() + 1).padStart(2, "0");
    const yyyy = String(fechaEmision.getFullYear());

    // Generate XML
    const xmlGenerado = generateInvoiceXML({
      ambiente: bp.ambiente,
      tipoEmision: bp.tipoEmision || "NORMAL",
      razonSocial: bp.razonSocial,
      nombreComercial: bp.nombreComercial || undefined,
      ruc: bp.ruc,
      claveAcceso,
      establecimiento: bp.establishment,
      puntoEmision: bp.emissionPoint,
      secuencial,
      direccionMatriz: bp.direccionMatriz,
      contribuyenteEspecial: bp.contribuyenteEspecial || undefined,
      obligadoContabilidad: bp.obligadoContabilidad,
      fechaEmision: `${dd}/${mm}/${yyyy}`,
      direccionEstablecimiento: bp.direccionSucursal || undefined,
      tipoIdentificacionComprador: customer.tipoIdentificacion,
      razonSocialComprador: customer.razonSocial,
      identificacionComprador: customer.identificacion,
      totalSinImpuestos: subtotalSinImpuestos,
      totalDescuento,
      subtotal15, subtotal0, subtotalNoObjeto, subtotalExento, iva15,
      importeTotal,
      moneda: "DOLAR",
      formaPago: data.formaPago,
      formaPagoTotal: importeTotal,
      plazo: 0,
      items: processedItems,
      infoAdicional: {
        ...(customer.direccion ? { Dirección: customer.direccion } : {}),
        ...(customer.telefono ? { Teléfono: customer.telefono } : {}),
        ...(customer.email ? { Email: customer.email } : {}),
      },
    });

    // Create invoice
    const invoice = await tx.invoice.create({
      data: {
        tenantId,
        businessProfileId: bp.id,
        customerId: data.customerId,
        invoiceNumber,
        establishment: bp.establishment,
        emissionPoint: bp.emissionPoint,
        sequential,
        claveAcceso,
        fechaEmision,
        ambiente: bp.ambiente,
        tipoEmision: bp.tipoEmision || "NORMAL",
        subtotalSinImpuestos,
        subtotal15, subtotal0, subtotalNoObjeto, subtotalExento,
        totalDescuento, iva15, importeTotal,
        formaPago: data.formaPago,
        formaPagoDescripcion: FORMAS_PAGO[data.formaPago] || "EFECTIVO",
        estado: "EMITIDA",
        xmlGenerado,
        notes: data.notes,
        orderId: data.orderId,
        items: {
          create: processedItems,
        },
      },
      include: { customer: true, items: true },
    });

    return invoice;
  });
}

export async function getInvoiceStats(tenantId: string) {
  const [total, emitidas, anuladas, totalRevenue] = await Promise.all([
    prisma.invoice.count({ where: { tenantId } }),
    prisma.invoice.count({ where: { tenantId, estado: "EMITIDA" } }),
    prisma.invoice.count({ where: { tenantId, estado: "ANULADA" } }),
    prisma.invoice.aggregate({ where: { tenantId, estado: "EMITIDA" }, _sum: { importeTotal: true } }),
  ]);
  return { total, emitidas, anuladas, totalRevenue: totalRevenue._sum.importeTotal || 0 };
}
