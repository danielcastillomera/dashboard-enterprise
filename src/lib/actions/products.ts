"use server";

import { revalidatePath } from "next/cache";
import * as db from "@/lib/db/queries";

/* ============================================
   PRODUCT SERVER ACTIONS
   ============================================ */

export async function createProductAction(formData: FormData) {
  const data = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    price: parseFloat(formData.get("price") as string),
    cost: parseFloat(formData.get("cost") as string),
    stock: parseInt(formData.get("stock") as string, 10),
    minStock: parseInt(formData.get("minStock") as string, 10) || 5,
    categoryId: formData.get("categoryId") as string,
    brand: (formData.get("brand") as string) || undefined,
    color: (formData.get("color") as string) || undefined,
    isOffer: formData.get("isOffer") === "true",
    offerPrice: formData.get("offerPrice")
      ? parseFloat(formData.get("offerPrice") as string)
      : undefined,
  };

  if (!data.name || !data.categoryId || isNaN(data.price) || isNaN(data.cost)) {
    return { error: "Faltan campos obligatorios" };
  }

  try {
    await db.createProduct(data);
    revalidatePath("/productos");
    revalidatePath("/panel");
    revalidatePath("/inventario");
    return { success: "Producto creado exitosamente" };
  } catch {
    return { error: "Error al crear el producto" };
  }
}

export async function updateProductAction(id: string, formData: FormData) {
  const data: Record<string, unknown> = {};

  const fields = ["name", "description", "brand", "color", "categoryId"];
  fields.forEach((f) => {
    const val = formData.get(f) as string;
    if (val) data[f] = val;
  });

  const numFields = ["price", "cost", "stock", "minStock", "offerPrice"];
  numFields.forEach((f) => {
    const val = formData.get(f);
    if (val && !isNaN(Number(val))) data[f] = parseFloat(val as string);
  });

  data.isOffer = formData.get("isOffer") === "true";
  data.isActive = formData.get("isActive") !== "false";

  try {
    await db.updateProduct(id, data);
    revalidatePath("/productos");
    revalidatePath("/panel");
    revalidatePath("/inventario");
    return { success: "Producto actualizado" };
  } catch {
    return { error: "Error al actualizar el producto" };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await db.deleteProduct(id);
    revalidatePath("/productos");
    revalidatePath("/panel");
    return { success: "Producto desactivado" };
  } catch {
    return { error: "Error al eliminar el producto" };
  }
}
