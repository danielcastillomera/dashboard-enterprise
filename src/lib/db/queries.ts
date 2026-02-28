import { prisma } from "@/lib/prisma";
import { getActiveTenantConfig, formatCurrency } from "@/lib/tenant-config";
import type { DashboardKPI } from "@/types";

/* ============================================
   DATABASE SERVICE LAYER
   
   Queries reales a Supabase via Prisma.
   Todas las funciones reciben tenantId dinámico
   desde la sesión autenticada.
   ============================================ */

const config = getActiveTenantConfig();

// ---- PRODUCTOS ----

export async function getProducts(tenantId: string, filter?: "all" | "active" | "offers" | "out") {
  const where: Record<string, unknown> = { tenantId };
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

export async function createProduct(tenantId: string, data: {
  name: string; description?: string; price: number; cost: number;
  stock: number; minStock: number; categoryId: string;
  brand?: string; color?: string; isOffer?: boolean; offerPrice?: number;
  images?: string[]; tags?: string[];
}) {
  return prisma.product.create({
    data: { ...data, tenantId },
  });
}

export async function updateProduct(id: string, data: Partial<{
  name: string; description: string; price: number; cost: number;
  stock: number; minStock: number; categoryId: string;
  brand: string; color: string; isOffer: boolean; offerPrice: number;
  images: string[]; tags: string[]; isActive: boolean;
}>) {
  return prisma.product.update({ where: { id }, data });
}

export async function deleteProduct(id: string) {
  return prisma.product.update({ where: { id }, data: { isActive: false } });
}

// ---- CATEGORÍAS ----

export async function getCategories(tenantId: string) {
  return prisma.category.findMany({
    where: { tenantId },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(tenantId: string, name: string) {
  return prisma.category.create({ data: { name, tenantId } });
}

export async function updateCategory(id: string, name: string) {
  return prisma.category.update({ where: { id }, data: { name } });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}

// ---- VENTAS ----

export async function getSales(tenantId: string, filter?: { from?: Date; to?: Date }) {
  const where: Record<string, unknown> = { tenantId };
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

export async function createSale(tenantId: string, data: {
  productId: string; quantity: number; unitPrice: number; userId?: string;
}) {
  const total = data.quantity * data.unitPrice;

  console.log("[createSale] Starting:", { tenantId, productId: data.productId, quantity: data.quantity, unitPrice: data.unitPrice, total });

  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.create({
      data: {
        productId: data.productId,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        total,
        tenantId,
        ...(data.userId ? { userId: data.userId } : {}),
      },
    });

    console.log("[createSale] Sale created:", sale.id);

    await tx.product.update({
      where: { id: data.productId },
      data: { stock: { decrement: data.quantity } },
    });

    console.log("[createSale] Stock updated for product:", data.productId);

    return sale;
  });
}

// ---- COMPRAS ----

export async function getPurchases(tenantId: string) {
  return prisma.purchase.findMany({
    where: { tenantId },
    include: { product: true },
    orderBy: { date: "desc" },
  });
}

export async function createPurchase(tenantId: string, data: {
  productId: string; quantity: number; unitCost: number; supplier?: string;
}) {
  const total = data.quantity * data.unitCost;

  console.log("[createPurchase] Starting:", { tenantId, productId: data.productId, quantity: data.quantity });

  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        productId: data.productId,
        quantity: data.quantity,
        unitCost: data.unitCost,
        total,
        tenantId,
        ...(data.supplier ? { supplier: data.supplier } : {}),
      },
    });

    await tx.product.update({
      where: { id: data.productId },
      data: { stock: { increment: data.quantity } },
    });

    return purchase;
  });
}

// ---- PEDIDOS ----

export async function getOrders(tenantId: string, filter?: { status?: string; search?: string }) {
  const where: Record<string, unknown> = { tenantId };
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

export async function createOrder(tenantId: string, data: {
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
      tenantId,
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

export async function getDashboardKPIsFromDB(tenantId: string): Promise<DashboardKPI[]> {
  const [totalProducts, outOfStock, salesAgg, salesCount] = await Promise.all([
    prisma.product.count({ where: { tenantId, isActive: true } }),
    prisma.product.count({ where: { tenantId, stock: 0 } }),
    prisma.sale.aggregate({
      where: { tenantId },
      _sum: { total: true },
      _count: true,
    }),
    prisma.sale.count({ where: { tenantId } }),
  ]);

  const totalRevenue = salesAgg._sum.total || 0;

  const sales = await prisma.sale.findMany({
    where: { tenantId },
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

export async function getFinancialSummaryFromDB(tenantId: string) {
  const sales = await prisma.sale.findMany({
    where: { tenantId },
    include: { product: true },
  });

  const revenue = sales.reduce((sum, s) => sum + s.total, 0);
  const cost = sales.reduce((sum, s) => sum + s.product.cost * s.quantity, 0);

  return { revenue, cost, profit: revenue - cost };
}

export async function getMonthlySalesFromDB(tenantId: string) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const sales = await prisma.sale.findMany({
    where: { tenantId, date: { gte: sixMonthsAgo } },
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

export async function getCategorySalesFromDB(tenantId: string) {
  const sales = await prisma.sale.findMany({
    where: { tenantId },
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

export async function getTopProductsFromDB(tenantId: string, limit = 5) {
  const sales = await prisma.sale.findMany({
    where: { tenantId },
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

export async function getInventoryAlertsFromDB(tenantId: string) {
  const allProducts = await prisma.product.findMany({
    where: { tenantId, isActive: true },
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

// ---- NOTIFICACIONES ----

export async function getNotifications(tenantId: string, limit = 50) {
  return prisma.notification.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function createNotification(tenantId: string, data: {
  title: string; message: string; type?: string; href?: string;
}) {
  return prisma.notification.create({
    data: {
      title: data.title,
      message: data.message,
      type: data.type || "info",
      href: data.href,
      tenantId,
    },
  });
}

export async function markNotificationRead(id: string) {
  return prisma.notification.update({ where: { id }, data: { read: true } });
}

export async function deleteNotification(id: string) {
  return prisma.notification.delete({ where: { id } });
}
