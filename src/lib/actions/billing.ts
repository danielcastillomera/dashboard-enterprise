"use server";

interface ActionResult { success: boolean; message: string; data?: unknown; }

async function getTenantId(): Promise<string> {
  const { getCurrentTenantId } = await import("@/lib/db/get-tenant");
  return getCurrentTenantId();
}

// ---- CUSTOMERS ----

export async function getCustomersAction(): Promise<ActionResult> {
  try {
    const tenantId = await getTenantId();
    const { getCustomers } = await import("@/lib/billing/queries");
    const customers = await getCustomers(tenantId);
    return { success: true, message: "OK", data: customers };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Error" };
  }
}

export async function createCustomerAction(data: {
  tipoIdentificacion: string; identificacion: string; razonSocial: string;
  direccion?: string; telefono?: string; email?: string;
}): Promise<ActionResult> {
  try {
    const tenantId = await getTenantId();
    const { createCustomer } = await import("@/lib/billing/queries");
    const customer = await createCustomer(tenantId, data);
    return { success: true, message: "Cliente creado exitosamente", data: customer };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Error" };
  }
}

export async function updateCustomerAction(id: string, data: {
  tipoIdentificacion?: string; identificacion?: string; razonSocial?: string;
  direccion?: string; telefono?: string; email?: string;
}): Promise<ActionResult> {
  try {
    const { updateCustomer } = await import("@/lib/billing/queries");
    const customer = await updateCustomer(id, data);
    return { success: true, message: "Cliente actualizado", data: customer };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Error" };
  }
}

export async function deleteCustomerAction(id: string): Promise<ActionResult> {
  try {
    const { deleteCustomer } = await import("@/lib/billing/queries");
    await deleteCustomer(id);
    return { success: true, message: "Cliente eliminado" };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Error" };
  }
}

// ---- BUSINESS PROFILE ----

export async function getBusinessProfileAction(): Promise<ActionResult> {
  try {
    const tenantId = await getTenantId();
    const { getBusinessProfile } = await import("@/lib/billing/queries");
    const bp = await getBusinessProfile(tenantId);
    return { success: true, message: "OK", data: bp };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Error" };
  }
}

export async function saveBusinessProfileAction(data: {
  ruc: string; razonSocial: string; nombreComercial?: string;
  direccionMatriz: string; direccionSucursal?: string;
  telefono?: string; email?: string; website?: string; logoUrl?: string;
  ambiente?: string; obligadoContabilidad?: boolean;
  contribuyenteEspecial?: string; regimenRimpe?: boolean;
  ivaRate?: number; establishment?: string; emissionPoint?: string;
}): Promise<ActionResult> {
  try {
    const tenantId = await getTenantId();
    const { upsertBusinessProfile } = await import("@/lib/billing/queries");
    const bp = await upsertBusinessProfile(tenantId, data);
    return { success: true, message: "Configuración guardada", data: bp };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Error" };
  }
}

// ---- INVOICES ----

export async function getInvoicesAction(): Promise<ActionResult> {
  try {
    const tenantId = await getTenantId();
    const { getInvoices } = await import("@/lib/billing/queries");
    const invoices = await getInvoices(tenantId);
    return { success: true, message: "OK", data: invoices };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Error" };
  }
}

export async function createInvoiceAction(data: {
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
}): Promise<ActionResult> {
  try {
    if (!data.customerId) return { success: false, message: "Seleccione un cliente" };
    if (data.items.length === 0) return { success: false, message: "Agregue al menos un producto" };

    const tenantId = await getTenantId();
    const { createInvoice } = await import("@/lib/billing/queries");
    const invoice = await createInvoice(tenantId, data);
    return { success: true, message: `Factura ${invoice.invoiceNumber} emitida exitosamente`, data: invoice };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Error al crear factura" };
  }
}

export async function getInvoiceStatsAction(): Promise<ActionResult> {
  try {
    const tenantId = await getTenantId();
    const { getInvoiceStats } = await import("@/lib/billing/queries");
    const stats = await getInvoiceStats(tenantId);
    return { success: true, message: "OK", data: stats };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Error" };
  }
}
