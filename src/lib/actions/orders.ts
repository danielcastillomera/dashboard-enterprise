"use server";

import { revalidatePath } from "next/cache";
import * as db from "@/lib/db/queries";

export async function updateOrderStatusAction(id: string, status: string) {
  try {
    await db.updateOrderStatus(id, status);
    revalidatePath("/pedidos");
    revalidatePath("/panel");
    return { success: `Pedido actualizado a: ${status}` };
  } catch {
    return { error: "Error al actualizar el pedido" };
  }
}

export async function createOrderAction(formData: FormData) {
  const data = {
    clientName: formData.get("clientName") as string,
    clientEmail: (formData.get("clientEmail") as string) || undefined,
    deliveryAddress: (formData.get("deliveryAddress") as string) || undefined,
    items: JSON.parse(formData.get("items") as string || "[]"),
  };

  if (!data.clientName || data.items.length === 0) {
    return { error: "Faltan datos del pedido" };
  }

  try {
    await db.createOrder(data);
    revalidatePath("/pedidos");
    revalidatePath("/panel");
    return { success: "Pedido creado exitosamente" };
  } catch {
    return { error: "Error al crear el pedido" };
  }
}
