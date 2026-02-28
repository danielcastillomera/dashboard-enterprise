import type {
  Product,
  Sale,
  Purchase,
  Order,
  Category,
  DashboardKPI,
} from "@/types";
import { getActiveTenantConfig, formatCurrency } from "@/lib/tenant-config";

/* ============================================
   DATOS MOCK - SERVICIO TEMPORAL
   
   Simula las consultas a Supabase.
   En Fase 5 se reemplaza por queries reales.
   La estructura es idéntica a la BD real,
   así la migración será directa.
   ============================================ */

const config = getActiveTenantConfig();

// ---- CATEGORÍAS ----
export const mockCategories: Category[] = [
  { id: "cat-1", name: "Herramientas Eléctricas", tenantId: config.id },
  { id: "cat-2", name: "Seguridad Industrial", tenantId: config.id },
  { id: "cat-3", name: "Accesorios", tenantId: config.id },
  { id: "cat-4", name: "Pinturas", tenantId: config.id },
  { id: "cat-5", name: "Audio / Electrónica", tenantId: config.id },
];

// ---- PRODUCTOS ----
export const mockProducts: Product[] = [
  {
    id: "prod-1", name: "Taladro Eléctrico Profesional", description: "Motor de alta potencia para trabajos exigentes",
    price: 43, cost: 25, stock: 24, minStock: 10, categoryId: "cat-1",
    images: [], isActive: true, isOffer: false, brand: "DeWalt", color: "Amarillo y Negro",
    tags: ["destacado", "nuevo"], tenantId: config.id, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: "prod-2", name: "Cepilladora Eléctrica Azul", description: "Acabado profesional en madera",
    price: 100, cost: 65, stock: 3, minStock: 5, categoryId: "cat-1",
    images: [], isActive: true, isOffer: true, offerPrice: 85, brand: "Makita", color: "Azul",
    tags: ["oferta"], tenantId: config.id, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: "prod-3", name: "Sierra Eléctrica Azul y Blanca", description: "Cortes precisos en todo tipo de material",
    price: 90, cost: 55, stock: 18, minStock: 8, categoryId: "cat-1",
    images: [], isActive: true, isOffer: false, brand: "Bosch", color: "Azul y Blanca",
    tags: ["destacado"], tenantId: config.id, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: "prod-4", name: "Juego de Herramientas 30 Piezas", description: "Kit completo para el hogar y profesional",
    price: 96, cost: 58, stock: 0, minStock: 5, categoryId: "cat-3",
    images: [], isActive: true, isOffer: false, brand: "Stanley", color: "",
    tags: [], tenantId: config.id, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: "prod-5", name: "Casco de Seguridad Industrial", description: "Certificación ANSI, protección clase E",
    price: 42, cost: 22, stock: 45, minStock: 15, categoryId: "cat-2",
    images: [], isActive: true, isOffer: false, brand: "3M", color: "Amarillo",
    tags: ["destacado"], tenantId: config.id, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: "prod-6", name: "Audífonos Bluetooth Sony Inalámbricos", description: "Cancelación de ruido, 30h batería",
    price: 85, cost: 50, stock: 7, minStock: 10, categoryId: "cat-5",
    images: [], isActive: true, isOffer: true, offerPrice: 69, brand: "Sony", color: "Negro",
    tags: ["oferta", "nuevo"], tenantId: config.id, createdAt: new Date(), updatedAt: new Date(),
  },
];

// ---- VENTAS (últimos 6 meses) ----
export const mockSales: Sale[] = [
  { id: "s-1", productId: "prod-1", productName: "Taladro Eléctrico Profesional", quantity: 3, unitPrice: 43, total: 129, date: new Date("2026-02-15"), userId: "u-1", tenantId: config.id },
  { id: "s-2", productId: "prod-6", productName: "Audífonos Bluetooth Sony", quantity: 24, unitPrice: 69, total: 1656, date: new Date("2026-02-14"), userId: "u-1", tenantId: config.id },
  { id: "s-3", productId: "prod-6", productName: "Audífonos Bluetooth Sony", quantity: 3, unitPrice: 69, total: 207, date: new Date("2026-02-13"), userId: "u-1", tenantId: config.id },
  { id: "s-4", productId: "prod-5", productName: "Casco de Seguridad Industrial", quantity: 6, unitPrice: 42, total: 252, date: new Date("2026-02-10"), userId: "u-1", tenantId: config.id },
  { id: "s-5", productId: "prod-5", productName: "Casco de Seguridad Industrial", quantity: 1, unitPrice: 42, total: 42, date: new Date("2026-02-08"), userId: "u-1", tenantId: config.id },
  { id: "s-6", productId: "prod-6", productName: "Audífonos Bluetooth Sony", quantity: 10, unitPrice: 85, total: 850, date: new Date("2026-01-28"), userId: "u-1", tenantId: config.id },
  { id: "s-7", productId: "prod-3", productName: "Sierra Eléctrica Azul y Blanca", quantity: 5, unitPrice: 90, total: 450, date: new Date("2026-01-20"), userId: "u-1", tenantId: config.id },
  { id: "s-8", productId: "prod-1", productName: "Taladro Eléctrico Profesional", quantity: 8, unitPrice: 43, total: 344, date: new Date("2026-01-15"), userId: "u-1", tenantId: config.id },
  { id: "s-9", productId: "prod-2", productName: "Cepilladora Eléctrica Azul", quantity: 2, unitPrice: 85, total: 170, date: new Date("2025-12-18"), userId: "u-1", tenantId: config.id },
  { id: "s-10", productId: "prod-4", productName: "Juego Herramientas 30 Piezas", quantity: 4, unitPrice: 96, total: 384, date: new Date("2025-12-10"), userId: "u-1", tenantId: config.id },
  { id: "s-11", productId: "prod-5", productName: "Casco de Seguridad Industrial", quantity: 12, unitPrice: 42, total: 504, date: new Date("2025-11-22"), userId: "u-1", tenantId: config.id },
  { id: "s-12", productId: "prod-1", productName: "Taladro Eléctrico Profesional", quantity: 6, unitPrice: 43, total: 258, date: new Date("2025-11-05"), userId: "u-1", tenantId: config.id },
  { id: "s-13", productId: "prod-3", productName: "Sierra Eléctrica Azul y Blanca", quantity: 3, unitPrice: 90, total: 270, date: new Date("2025-10-15"), userId: "u-1", tenantId: config.id },
  { id: "s-14", productId: "prod-6", productName: "Audífonos Bluetooth Sony", quantity: 15, unitPrice: 85, total: 1275, date: new Date("2025-10-08"), userId: "u-1", tenantId: config.id },
  { id: "s-15", productId: "prod-2", productName: "Cepilladora Eléctrica Azul", quantity: 1, unitPrice: 100, total: 100, date: new Date("2025-09-20"), userId: "u-1", tenantId: config.id },
];

// ---- COMPRAS ----
export const mockPurchases: Purchase[] = [
  { id: "p-1", productId: "prod-6", productName: "Audífonos BT SoundMax Blancos Inalámbricos con Micrófono y Cargador USB-C", quantity: 100, unitCost: 50, total: 5000, supplier: "Sony Ecuador", date: new Date("2026-02-01"), tenantId: config.id },
  { id: "p-2", productId: "prod-6", productName: "Audífonos color negro marca Sony Inalámbrico", quantity: 16, unitCost: 50, total: 800, date: new Date("2026-01-15"), tenantId: config.id },
  { id: "p-3", productId: "prod-6", productName: "Audífonos color negro marca Sony Inalámbrico", quantity: 13, unitCost: 50, total: 650, date: new Date("2025-12-20"), tenantId: config.id },
];

// ---- PEDIDOS ----
export const mockOrders: Order[] = [
  { id: "PED-001", clientName: "Carlos Méndez", clientEmail: "carlos@email.com", deliveryAddress: "Guayaquil, Ecuador", items: [], subtotal: 120, shipping: 0, total: 120, status: "pendiente", date: new Date("2026-02-15"), tenantId: config.id },
  { id: "PED-002", clientName: "JuanFelipe Soto", deliveryAddress: "Guayaquil", items: [], subtotal: 715, shipping: 0, total: 715, status: "pagado", date: new Date("2026-02-14"), tenantId: config.id },
  { id: "PED-003", clientName: "Carlos Méndez", deliveryAddress: "Guayaquil, Ecuador", items: [], subtotal: 43, shipping: 0, total: 43, status: "entregado", date: new Date("2026-02-13"), tenantId: config.id },
  { id: "PED-004", clientName: "edgar", deliveryAddress: "Guayaquil, Ecuador", items: [], subtotal: 156, shipping: 0, total: 156, status: "entregado", date: new Date("2026-02-12"), tenantId: config.id },
  { id: "PED-005", clientName: "edgar", deliveryAddress: "Guayaquil, Ecuador", items: [], subtotal: 270, shipping: 0, total: 270, status: "entregado", date: new Date("2026-02-11"), tenantId: config.id },
  { id: "PED-006", clientName: "Carlos Méndez", deliveryAddress: "Guayaquil, Ecuador", items: [], subtotal: 45, shipping: 0, total: 45, status: "entregado", date: new Date("2026-02-10"), tenantId: config.id },
];

/* ============================================
   FUNCIONES DE CONSULTA (simulan queries)
   ============================================ */

export function getDashboardKPIs(): DashboardKPI[] {
  const totalProducts = mockProducts.length;
  const totalRevenue = mockSales.reduce((sum, s) => sum + s.total, 0);
  const totalCost = mockSales.reduce((sum, s) => {
    const product = mockProducts.find((p) => p.id === s.productId);
    return sum + (product ? product.cost * s.quantity : 0);
  }, 0);
  const realProfit = totalRevenue - totalCost;
  const totalSalesCount = mockSales.length;
  const avgPrice = totalRevenue / mockSales.reduce((sum, s) => sum + s.quantity, 0);
  const outOfStock = mockProducts.filter((p) => p.stock === 0).length;
  const lowStock = mockProducts.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;

  return [
    { label: "Total Productos", value: totalProducts, icon: "Boxes", color: "var(--color-status-info)" },
    { label: "Ingresos Totales", value: formatCurrency(totalRevenue, config), icon: "DollarSign", trend: 12.5, color: "var(--color-status-success)" },
    { label: "Ganancia Real", value: formatCurrency(realProfit, config), icon: "TrendingUp", trend: 8.3, color: "var(--color-brand-500)" },
    { label: "Ventas Realizadas", value: totalSalesCount, icon: "ShoppingCart", trend: -3.2, color: "var(--color-chart-4)" },
    { label: "Precio Promedio", value: formatCurrency(Math.round(avgPrice * 100) / 100, config), icon: "BarChart3", color: "var(--color-chart-5)" },
    { label: "Sin Stock", value: outOfStock, icon: "AlertTriangle", color: "var(--color-status-error)" },
  ];
}

export function getFinancialSummary() {
  const totalRevenue = mockSales.reduce((sum, s) => sum + s.total, 0);
  const totalCost = mockSales.reduce((sum, s) => {
    const product = mockProducts.find((p) => p.id === s.productId);
    return sum + (product ? product.cost * s.quantity : 0);
  }, 0);
  return {
    revenue: totalRevenue,
    cost: totalCost,
    profit: totalRevenue - totalCost,
  };
}

export function getMonthlySalesData() {
  const months = ["Sep", "Oct", "Nov", "Dic", "Ene", "Feb"];
  const monthMap: Record<string, { ventas: number; costos: number }> = {};
  months.forEach((m) => (monthMap[m] = { ventas: 0, costos: 0 }));

  mockSales.forEach((sale) => {
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const monthKey = monthNames[sale.date.getMonth()];
    if (monthMap[monthKey]) {
      monthMap[monthKey].ventas += sale.total;
      const product = mockProducts.find((p) => p.id === sale.productId);
      if (product) monthMap[monthKey].costos += product.cost * sale.quantity;
    }
  });

  return months.map((mes) => ({
    mes,
    ventas: monthMap[mes].ventas,
    costos: monthMap[mes].costos,
    margen: monthMap[mes].ventas - monthMap[mes].costos,
  }));
}

export function getCategorySalesData() {
  const catSales: Record<string, number> = {};
  mockSales.forEach((sale) => {
    const product = mockProducts.find((p) => p.id === sale.productId);
    if (product) {
      const cat = mockCategories.find((c) => c.id === product.categoryId);
      const catName = cat?.name || "Otros";
      catSales[catName] = (catSales[catName] || 0) + sale.total;
    }
  });

  const colors = ["#F59E0B", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899"];
  return Object.entries(catSales)
    .map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }))
    .sort((a, b) => b.value - a.value);
}

export function getTopProducts(limit = 5) {
  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
  mockSales.forEach((sale) => {
    if (!productSales[sale.productId]) {
      productSales[sale.productId] = { name: sale.productName, quantity: 0, revenue: 0 };
    }
    productSales[sale.productId].quantity += sale.quantity;
    productSales[sale.productId].revenue += sale.total;
  });

  return Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

export function getRecentOrders(limit = 5) {
  return [...mockOrders].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, limit);
}

export function getInventoryAlerts() {
  return mockProducts
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
