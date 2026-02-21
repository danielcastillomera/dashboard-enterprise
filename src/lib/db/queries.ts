import { prisma } from "@/lib/prisma";
import { getActiveTenantConfig, formatCurrency } from "@/lib/tenant-config";
import type { DashboardKPI } from "@/types";

/* ============================================
   DATABASE SERVICE LAYER
   
   Queries reales a Supabase via Prisma.
   Cada función tiene la misma firma que mock-data.ts
   para facilitar la migración.
   ============================================ */

const config = getActiveTenantConfig();
const TENANT_ID = config.id;

// ---- PRODUCTOS ----

export async function getProducts(filter?: "all" | "active" | "offers" | "out") {
  const where: Record<string, unknown> = { tenantId: TENANT_ID };
  if (filter === "active") where.isActive = true;
  if (filter === "offers") where.isOffer = true;
  if (filter === "out") where.stock = 0;

  return prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({ where: { id }, include: { category: true } });
}

export async function createProduct(data: {
  name: string; description?: string; price: number; cost: number;
  stock: number; minStock: number; categoryId: string;
  brand?: string; color?: string; isOffer?: boolean; offerPrice?: number;
  images?: string[]; tags?: string[];
}) {
  return prisma.product.create({
    data: { ...data, tenantId: TENANT_ID },
  });
}

export async function updateProduct(id: string, data: Partial<Parameters<typeof createProduct>[0]>) {
  return prisma.product.update({ where: { id }, data });
}

export async function deleteProduct(id: string) {
  return prisma.product.update({ where: { id }, data: { isActive: false } });
}

// ---- CATEGORÍAS ----

export async function getCategories() {
  return prisma.category.findMany({
    where: { tenantId: TENANT_ID },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(name: string) {
  return prisma.category.create({ data: { name, tenantId: TENANT_ID } });
}

export async function updateCategory(id: string, name: string) {
  return prisma.category.update({ where: { id }, data: { name } });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}

// ---- VENTAS ----

export async function getSales(filter?: { from?: Date; to?: Date }) {
  const where: Record<string, unknown> = { tenantId: TENANT_ID };
  if (filter?.from || filter?.to) {
    where.date = {};
    if (filter.from) (where.date as Record<string, Date>).gte = filter.from;
    if (filter.to) (where.date as Record<string, Date>).lte = filter.to;
  }

  return prisma.sale.findMany({
    where,
    include: { product: true },
    orderBy: { date: "desc" },
  });
}

export async function createSale(data: {
  productId: string; quantity: number; unitPrice: number; userId?: string;
}) {
  const total = data.quantity * data.unitPrice;

  // Transacción: crear venta + actualizar stock
  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.create({
      data: { ...data, total, tenantId: TENANT_ID },
    });

    await tx.product.update({
      where: { id: data.productId },
      data: { stock: { decrement: data.quantity } },
    });

    return sale;
  });
}

// ---- COMPRAS ----

export async function getPurchases() {
  return prisma.purchase.findMany({
    where: { tenantId: TENANT_ID },
    include: { product: true },
    orderBy: { date: "desc" },
  });
}

export async function createPurchase(data: {
  productId: string; quantity: number; unitCost: number; supplier?: string;
}) {
  const total = data.quantity * data.unitCost;

  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: { ...data, total, tenantId: TENANT_ID },
    });

    await tx.product.update({
      where: { id: data.productId },
      data: { stock: { increment: data.quantity } },
    });

    return purchase;
  });
}

// ---- PEDIDOS ----

export async function getOrders(filter?: { status?: string; search?: string }) {
  const where: Record<string, unknown> = { tenantId: TENANT_ID };
  if (filter?.status && filter.status !== "todos") where.status = filter.status;
  if (filter?.search) {
    where.OR = [
      { clientName: { contains: filter.search, mode: "insensitive" } },
      { id: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  return prisma.order.findMany({
    where,
    include: { items: { include: { product: true } } },
    orderBy: { date: "desc" },
  });
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
}

export async function createOrder(data: {
  clientName: string; clientEmail?: string; deliveryAddress?: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
}) {
  const subtotal = data.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  return prisma.order.create({
    data: {
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      deliveryAddress: data.deliveryAddress,
      subtotal,
      total: subtotal,
      tenantId: TENANT_ID,
      items: {
        create: data.items.map((item) => ({
          ...item,
          subtotal: item.quantity * item.unitPrice,
        })),
      },
    },
    include: { items: true },
  });
}

export async function updateOrderStatus(id: string, status: string) {
  return prisma.order.update({ where: { id }, data: { status } });
}

// ---- DASHBOARD KPIs ----

export async function getDashboardKPIsFromDB(): Promise<DashboardKPI[]> {
  const [
    totalProducts,
    outOfStock,
    salesAgg,
    salesCount,
  ] = await Promise.all([
    prisma.product.count({ where: { tenantId: TENANT_ID, isActive: true } }),
    prisma.product.count({ where: { tenantId: TENANT_ID, stock: 0 } }),
    prisma.sale.aggregate({
      where: { tenantId: TENANT_ID },
      _sum: { total: true },
      _count: true,
    }),
    prisma.sale.count({ where: { tenantId: TENANT_ID } }),
  ]);

  const totalRevenue = salesAgg._sum.total || 0;

  // Calcular costo total y precio promedio
  const sales = await prisma.sale.findMany({
    where: { tenantId: TENANT_ID },
    include: { product: true },
  });

  const totalCost = sales.reduce((sum, s) => sum + s.product.cost * s.quantity, 0);
  const totalQty = sales.reduce((sum, s) => sum + s.quantity, 0);
  const avgPrice = totalQty > 0 ? totalRevenue / totalQty : 0;

  return [
    { label: "Total Productos", value: totalProducts, icon: "Boxes", color: "var(--color-status-info)" },
    { label: "Ingresos Totales", value: formatCurrency(totalRevenue, config), icon: "DollarSign", trend: 12.5, color: "var(--color-status-success)" },
    { label: "Ganancia Real", value: formatCurrency(totalRevenue - totalCost, config), icon: "TrendingUp", trend: 8.3, color: "var(--color-brand-500)" },
    { label: "Ventas Realizadas", value: salesCount, icon: "ShoppingCart", color: "var(--color-chart-4)" },
    { label: "Precio Promedio", value: formatCurrency(Math.round(avgPrice * 100) / 100, config), icon: "BarChart3", color: "var(--color-chart-5)" },
    { label: "Sin Stock", value: outOfStock, icon: "AlertTriangle", color: "var(--color-status-error)" },
  ];
}

export async function getFinancialSummaryFromDB() {
  const sales = await prisma.sale.findMany({
    where: { tenantId: TENANT_ID },
    include: { product: true },
  });

  const revenue = sales.reduce((sum, s) => sum + s.total, 0);
  const cost = sales.reduce((sum, s) => sum + s.product.cost * s.quantity, 0);

  return { revenue, cost, profit: revenue - cost };
}

export async function getMonthlySalesFromDB() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const sales = await prisma.sale.findMany({
    where: { tenantId: TENANT_ID, date: { gte: sixMonthsAgo } },
    include: { product: true },
    orderBy: { date: "asc" },
  });

  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const monthMap: Record<string, { ventas: number; costos: number }> = {};

  sales.forEach((sale) => {
    const key = monthNames[sale.date.getMonth()];
    if (!monthMap[key]) monthMap[key] = { ventas: 0, costos: 0 };
    monthMap[key].ventas += sale.total;
    monthMap[key].costos += sale.product.cost * sale.quantity;
  });

  return Object.entries(monthMap).map(([mes, data]) => ({
    mes,
    ventas: data.ventas,
    costos: data.costos,
    margen: data.ventas - data.costos,
  }));
}

export async function getCategorySalesFromDB() {
  const sales = await prisma.sale.findMany({
    where: { tenantId: TENANT_ID },
    include: { product: { include: { category: true } } },
  });

  const catSales: Record<string, number> = {};
  sales.forEach((sale) => {
    const catName = sale.product.category.name;
    catSales[catName] = (catSales[catName] || 0) + sale.total;
  });

  const colors = ["#F59E0B", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899"];
  return Object.entries(catSales)
    .map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }))
    .sort((a, b) => b.value - a.value);
}

export async function getTopProductsFromDB(limit = 5) {
  const sales = await prisma.sale.findMany({
    where: { tenantId: TENANT_ID },
    include: { product: true },
  });

  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
  sales.forEach((sale) => {
    if (!productSales[sale.productId]) {
      productSales[sale.productId] = { name: sale.product.name, quantity: 0, revenue: 0 };
    }
    productSales[sale.productId].quantity += sale.quantity;
    productSales[sale.productId].revenue += sale.total;
  });

  return Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

export async function getInventoryAlertsFromDB() {
  const allProducts = await prisma.product.findMany({
    where: { tenantId: TENANT_ID, isActive: true },
  });

  return allProducts
    .filter((p) => p.stock <= p.minStock)
    .map((p) => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      minStock: p.minStock,
      status: p.stock === 0 ? ("agotado" as const) : ("bajo" as const),
    }))
    .sort((a, b) => a.stock - b.stock);
}
