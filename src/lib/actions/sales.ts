"use server";

import { revalidatePath } from "next/cache";
import * as db from "@/lib/db/queries";
import { getCurrentTenantId } from "@/lib/db/get-tenant";

export async function createSaleServerAction(formData: FormData) {
  const data = {
    productId: formData.get("productId") as string,
    quantity: parseInt(formData.get("quantity") as string, 10),
    unitPrice: parseFloat(formData.get("unitPrice") as string),
    userId: (formData.get("userId") as string) || undefined,
  };

  if (!data.productId || isNaN(data.quantity) || isNaN(data.unitPrice)) {
    return { error: "Faltan campos obligatorios" };
  }

  try {
    const tenantId = await getCurrentTenantId();
    await db.createSale(tenantId, data);
    revalidatePath("/ventas");
    revalidatePath("/panel");
    revalidatePath("/inventario");
    return { success: "Venta registrada exitosamente" };
  } catch {
    return { error: "Error al registrar la venta" };
  }
}
