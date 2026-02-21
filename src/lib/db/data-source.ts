/* ============================================
   DATA SOURCE SWITCHER
   
   Importa este módulo en lugar de mock-data.ts.
   Automáticamente usa datos mock o Supabase
   según la variable de entorno USE_REAL_DB.
   
   Para activar Supabase real:
   1. Configurá DATABASE_URL en .env.local
   2. Agregá USE_REAL_DB=true
   3. Ejecutá: npx prisma db push && npx prisma db seed
   ============================================ */

import {
  getDashboardKPIs as getMockKPIs,
  getFinancialSummary as getMockFinancial,
  getMonthlySalesData as getMockMonthlySales,
  getCategorySalesData as getMockCategorySales,
  getTopProducts as getMockTopProducts,
  getRecentOrders as getMockRecentOrders,
  getInventoryAlerts as getMockInventoryAlerts,
  mockProducts,
  mockSales,
  mockPurchases,
  mockOrders,
  mockCategories,
} from "@/lib/mock-data";

const USE_REAL_DB = process.env.USE_REAL_DB === "true";

// Importaciones dinámicas para evitar errores cuando Prisma no está generado
async function getDbModule() {
  if (!USE_REAL_DB) return null;
  try {
    return await import("@/lib/db/queries");
  } catch {
    console.warn("⚠️ Prisma client no disponible. Usando datos mock.");
    return null;
  }
}

// ---- DASHBOARD ----

export async function fetchDashboardKPIs() {
  const db = await getDbModule();
  if (db) return db.getDashboardKPIsFromDB();
  return getMockKPIs();
}

export async function fetchFinancialSummary() {
  const db = await getDbModule();
  if (db) return db.getFinancialSummaryFromDB();
  return getMockFinancial();
}

export async function fetchMonthlySales() {
  const db = await getDbModule();
  if (db) return db.getMonthlySalesFromDB();
  return getMockMonthlySales();
}

export async function fetchCategorySales() {
  const db = await getDbModule();
  if (db) return db.getCategorySalesFromDB();
  return getMockCategorySales();
}

export async function fetchTopProducts(limit = 5) {
  const db = await getDbModule();
  if (db) return db.getTopProductsFromDB(limit);
  return getMockTopProducts(limit);
}

export async function fetchRecentOrders(limit = 5) {
  const db = await getDbModule();
  if (db) {
    const orders = await db.getOrders();
    return orders.slice(0, limit).map((o) => ({
      id: o.id,
      clientName: o.clientName,
      clientEmail: o.clientEmail || undefined,
      deliveryAddress: o.deliveryAddress || undefined,
      items: [],
      subtotal: o.subtotal,
      shipping: o.shipping,
      total: o.total,
      status: o.status,
      date: o.date,
      tenantId: o.tenantId,
    }));
  }
  return getMockRecentOrders(limit);
}

export async function fetchInventoryAlerts() {
  const db = await getDbModule();
  if (db) return db.getInventoryAlertsFromDB();
  return getMockInventoryAlerts();
}

// ---- PRODUCTOS ----

export async function fetchProducts(filter?: string) {
  const db = await getDbModule();
  if (db) {
    const dbFilter = filter === "Activos" ? "active" : filter === "Ofertas" ? "offers" : filter === "Agotados" ? "out" : "all";
    const products = await db.getProducts(dbFilter as "all" | "active" | "offers" | "out");
    return products.map((p) => ({
      ...p,
      description: p.description || "",
      offerPrice: p.offerPrice || undefined,
      brand: p.brand || "",
      color: p.color || "",
    }));
  }
  if (filter === "Activos") return mockProducts.filter((p) => p.isActive);
  if (filter === "Ofertas") return mockProducts.filter((p) => p.isOffer);
  if (filter === "Agotados") return mockProducts.filter((p) => p.stock === 0);
  return mockProducts;
}

export async function fetchCategories() {
  const db = await getDbModule();
  if (db) return db.getCategories();
  return mockCategories;
}

// ---- VENTAS ----

export async function fetchSales(filter?: { from?: Date; to?: Date }) {
  const db = await getDbModule();
  if (db) {
    const sales = await db.getSales(filter);
    return sales.map((s) => ({
      id: s.id,
      productId: s.productId,
      productName: s.product.name,
      quantity: s.quantity,
      unitPrice: s.unitPrice,
      total: s.total,
      date: s.date,
      userId: s.userId || "u-1",
      tenantId: s.tenantId,
    }));
  }
  return mockSales;
}

// ---- COMPRAS ----

export async function fetchPurchases() {
  const db = await getDbModule();
  if (db) {
    const purchases = await db.getPurchases();
    return purchases.map((p) => ({
      id: p.id,
      productId: p.productId,
      productName: p.product.name,
      quantity: p.quantity,
      unitCost: p.unitCost,
      total: p.total,
      supplier: p.supplier || undefined,
      date: p.date,
      tenantId: p.tenantId,
    }));
  }
  return mockPurchases;
}

// ---- PEDIDOS ----

export async function fetchOrders(filter?: { status?: string; search?: string }) {
  const db = await getDbModule();
  if (db) {
    const orders = await db.getOrders(filter);
    return orders.map((o) => ({
      id: o.id,
      clientName: o.clientName,
      clientEmail: o.clientEmail || undefined,
      deliveryAddress: o.deliveryAddress || undefined,
      items: o.items.map((i) => ({
        productId: i.productId,
        productName: i.product.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        subtotal: i.subtotal,
      })),
      subtotal: o.subtotal,
      shipping: o.shipping,
      total: o.total,
      status: o.status,
      date: o.date,
      tenantId: o.tenantId,
    }));
  }

  let result = [...mockOrders];
  if (filter?.status && filter.status !== "todos") {
    result = result.filter((o) => o.status === filter.status);
  }
  if (filter?.search) {
    const s = filter.search.toLowerCase();
    result = result.filter((o) => o.clientName.toLowerCase().includes(s) || o.id.toLowerCase().includes(s));
  }
  return result;
}
