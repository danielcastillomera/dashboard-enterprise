"use server";

/* ============================================
   SERVER ACTIONS — CRUD MUTATIONS
   Estándar: Next.js 16 Server Actions
   
   Maneja create/update/delete con validación.
   Usa Prisma cuando USE_REAL_DB=true,
   retorna respuestas simuladas cuando es mock.
   ============================================ */

const USE_REAL_DB = process.env.USE_REAL_DB === "true";

async function getDb() {
  if (!USE_REAL_DB) return null;
  try {
    return await import("@/lib/db/queries");
  } catch {
    return null;
  }
}

async function getTenantId(): Promise<string> {
  if (!USE_REAL_DB) return "mock";
  const { getCurrentTenantId } = await import("@/lib/db/get-tenant");
  return getCurrentTenantId();
}

// ======== RESPONSE TYPE ========
interface ActionResult {
  success: boolean;
  message: string;
  data?: unknown;
}

// ======== PRODUCTOS ========

export async function createProductAction(formData: {
  name: string; description?: string; price: number; cost: number;
  stock: number; minStock: number; categoryId: string;
  brand?: string; color?: string; isOffer?: boolean; offerPrice?: number;
}): Promise<ActionResult> {
  try {
    const db = await getDb();
    if (db) {
      const tenantId = await getTenantId();
      const product = await db.createProduct(tenantId, formData);
      return { success: true, message: "Producto creado exitosamente", data: product };
    }
    return { success: true, message: "Producto creado exitosamente (demo)" };
  } catch (error) {
    console.error("createProductAction error:", error);
    return { success: false, message: "Error al crear el producto" };
  }
}

export async function updateProductAction(id: string, formData: {
  name?: string; description?: string; price?: number; cost?: number;
  stock?: number; minStock?: number; categoryId?: string;
  brand?: string; color?: string; isOffer?: boolean; offerPrice?: number;
}): Promise<ActionResult> {
  try {
    const db = await getDb();
    if (db) {
      const product = await db.updateProduct(id, formData);
      return { success: true, message: "Producto actualizado exitosamente", data: product };
    }
    return { success: true, message: "Producto actualizado exitosamente (demo)" };
  } catch (error) {
    console.error("updateProductAction error:", error);
    return { success: false, message: "Error al actualizar el producto" };
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  try {
    const db = await getDb();
    if (db) {
      await db.deleteProduct(id);
      return { success: true, message: "Producto desactivado exitosamente" };
    }
    return { success: true, message: "Producto desactivado exitosamente (demo)" };
  } catch (error) {
    console.error("deleteProductAction error:", error);
    return { success: false, message: "Error al desactivar el producto" };
  }
}

// ======== CATEGORÍAS ========

export async function createCategoryAction(name: string): Promise<ActionResult> {
  try {
    if (!name.trim()) return { success: false, message: "El nombre es requerido" };
    const db = await getDb();
    if (db) {
      const tenantId = await getTenantId();
      const category = await db.createCategory(tenantId, name.trim());
      return { success: true, message: "Categoría creada exitosamente", data: category };
    }
    return { success: true, message: "Categoría creada exitosamente (demo)" };
  } catch (error) {
    console.error("createCategoryAction error:", error);
    return { success: false, message: "Error al crear la categoría" };
  }
}

export async function updateCategoryAction(id: string, name: string): Promise<ActionResult> {
  try {
    const db = await getDb();
    if (db) {
      await db.updateCategory(id, name);
      return { success: true, message: "Categoría actualizada exitosamente" };
    }
    return { success: true, message: "Categoría actualizada exitosamente (demo)" };
  } catch (error) {
    console.error("updateCategoryAction error:", error);
    return { success: false, message: "Error al actualizar la categoría" };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  try {
    const db = await getDb();
    if (db) {
      await db.deleteCategory(id);
      return { success: true, message: "Categoría eliminada exitosamente" };
    }
    return { success: true, message: "Categoría eliminada exitosamente (demo)" };
  } catch (error) {
    console.error("deleteCategoryAction error:", error);
    return { success: false, message: "Error al eliminar la categoría" };
  }
}

// ======== VENTAS ========

export async function createSaleAction(data: {
  productId: string; quantity: number; unitPrice: number; userId?: string;
}): Promise<ActionResult> {
  try {
    if (!data.productId) return { success: false, message: "Debe seleccionar un producto" };
    if (data.quantity <= 0) return { success: false, message: "La cantidad debe ser mayor a 0" };
    if (data.unitPrice <= 0) return { success: false, message: "El precio debe ser mayor a 0" };

    console.log("[createSaleAction] Input:", JSON.stringify(data));

    const db = await getDb();
    if (db) {
      const tenantId = await getTenantId();
      console.log("[createSaleAction] tenantId:", tenantId);
      const sale = await db.createSale(tenantId, data);
      return { success: true, message: "Venta registrada exitosamente", data: sale };
    }
    return { success: true, message: "Venta registrada exitosamente (demo)" };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("createSaleAction error:", errMsg, error);
    return { success: false, message: `Error: ${errMsg}` };
  }
}

// ======== COMPRAS ========

export async function createPurchaseAction(data: {
  productId: string; quantity: number; unitCost: number; supplier?: string;
}): Promise<ActionResult> {
  try {
    if (!data.productId) return { success: false, message: "Debe seleccionar un producto" };
    if (data.quantity <= 0) return { success: false, message: "La cantidad debe ser mayor a 0" };
    const db = await getDb();
    if (db) {
      const tenantId = await getTenantId();
      const purchase = await db.createPurchase(tenantId, data);
      return { success: true, message: "Compra registrada exitosamente", data: purchase };
    }
    return { success: true, message: "Compra registrada exitosamente (demo)" };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("createPurchaseAction error:", errMsg, error);
    return { success: false, message: `Error: ${errMsg}` };
  }
}

// ======== PEDIDOS ========

export async function createOrderAction(data: {
  clientName: string; clientEmail?: string; deliveryAddress?: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
}): Promise<ActionResult> {
  try {
    if (!data.clientName.trim()) return { success: false, message: "El nombre del cliente es requerido" };
    if (data.items.length === 0) return { success: false, message: "Debe agregar al menos un producto" };
    const db = await getDb();
    if (db) {
      const tenantId = await getTenantId();
      const order = await db.createOrder(tenantId, data);
      return { success: true, message: "Pedido creado exitosamente", data: order };
    }
    return { success: true, message: "Pedido creado exitosamente (demo)" };
  } catch (error) {
    console.error("createOrderAction error:", error);
    return { success: false, message: "Error al crear el pedido" };
  }
}

export async function updateOrderStatusAction(id: string, status: string): Promise<ActionResult> {
  try {
    const validStatuses = ["pendiente", "pagado", "enviado", "entregado", "cancelado"];
    if (!validStatuses.includes(status)) return { success: false, message: "Estado inválido" };
    const db = await getDb();
    if (db) {
      await db.updateOrderStatus(id, status);
      return { success: true, message: `Pedido actualizado a ${status.toUpperCase()}` };
    }
    return { success: true, message: `Pedido actualizado a ${status.toUpperCase()} (demo)` };
  } catch (error) {
    console.error("updateOrderStatusAction error:", error);
    return { success: false, message: "Error al actualizar el pedido" };
  }
}
