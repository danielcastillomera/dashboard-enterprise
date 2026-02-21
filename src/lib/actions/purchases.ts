"use server";

import { revalidatePath } from "next/cache";
import * as db from "@/lib/db/queries";

export async function createPurchaseAction(formData: FormData) {
  const data = {
    productId: formData.get("productId") as string,
    quantity: parseInt(formData.get("quantity") as string, 10),
    unitCost: parseFloat(formData.get("unitCost") as string),
    supplier: (formData.get("supplier") as string) || undefined,
  };

  if (!data.productId || isNaN(data.quantity) || isNaN(data.unitCost)) {
    return { error: "Faltan campos obligatorios" };
  }

  try {
    await db.createPurchase(data);
    revalidatePath("/compras");
    revalidatePath("/panel");
    revalidatePath("/inventario");
    return { success: "Compra registrada exitosamente" };
  } catch {
    return { error: "Error al registrar la compra" };
  }
}
