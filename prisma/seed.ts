import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Sembrando base de datos...\n");

  // 1. Crear Tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: "tenant-ferreteria-001" },
    update: {},
    create: {
      id: "tenant-ferreteria-001",
      name: "Mi Ferretería",
      industry: "ferreteria",
      currency: "GTQ",
    },
  });
  console.log("✅ Tenant:", tenant.name);

  // 2. Crear Perfil Admin
  const profile = await prisma.profile.upsert({
    where: { email: "edgar@ferreteria.com" },
    update: {},
    create: {
      id: "profile-admin-001",
      email: "edgar@ferreteria.com",
      name: "Administrador",
      role: "admin",
      tenantId: tenant.id,
    },
  });
  console.log("✅ Admin:", profile.name);

  // 3. Categorías
  const categories = await Promise.all([
    prisma.category.upsert({ where: { id: "cat-1" }, update: {}, create: { id: "cat-1", name: "Herramientas Eléctricas", tenantId: tenant.id } }),
    prisma.category.upsert({ where: { id: "cat-2" }, update: {}, create: { id: "cat-2", name: "Seguridad Industrial", tenantId: tenant.id } }),
    prisma.category.upsert({ where: { id: "cat-3" }, update: {}, create: { id: "cat-3", name: "Accesorios", tenantId: tenant.id } }),
    prisma.category.upsert({ where: { id: "cat-4" }, update: {}, create: { id: "cat-4", name: "Pinturas", tenantId: tenant.id } }),
    prisma.category.upsert({ where: { id: "cat-5" }, update: {}, create: { id: "cat-5", name: "Audio / Electrónica", tenantId: tenant.id } }),
  ]);
  console.log(`✅ ${categories.length} categorías`);

  // 4. Productos
  const products = [
    { id: "prod-1", name: "Taladro Eléctrico Profesional", description: "Motor de alta potencia", price: 43, cost: 25, stock: 24, minStock: 10, categoryId: "cat-1", brand: "DeWalt", color: "Amarillo y Negro", tags: ["destacado", "nuevo"] },
    { id: "prod-2", name: "Cepilladora Eléctrica Azul", description: "Acabado profesional en madera", price: 100, cost: 65, stock: 3, minStock: 5, categoryId: "cat-1", brand: "Makita", color: "Azul", isOffer: true, offerPrice: 85, tags: ["oferta"] },
    { id: "prod-3", name: "Sierra Eléctrica Azul y Blanca", description: "Cortes precisos en todo material", price: 90, cost: 55, stock: 18, minStock: 8, categoryId: "cat-1", brand: "Bosch", color: "Azul y Blanca", tags: ["destacado"] },
    { id: "prod-4", name: "Juego de Herramientas 30 Piezas", description: "Kit completo hogar y profesional", price: 96, cost: 58, stock: 0, minStock: 5, categoryId: "cat-3", brand: "Stanley" },
    { id: "prod-5", name: "Casco de Seguridad Industrial", description: "Certificación ANSI clase E", price: 42, cost: 22, stock: 45, minStock: 15, categoryId: "cat-2", brand: "3M", color: "Amarillo", tags: ["destacado"] },
    { id: "prod-6", name: "Audífonos Bluetooth Sony Inalámbricos", description: "Cancelación de ruido, 30h batería", price: 85, cost: 50, stock: 7, minStock: 10, categoryId: "cat-5", brand: "Sony", color: "Negro", isOffer: true, offerPrice: 69, tags: ["oferta", "nuevo"] },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: { ...p, tenantId: tenant.id, isActive: true, isOffer: p.isOffer || false, images: [] },
    });
  }
  console.log(`✅ ${products.length} productos`);

  // 5. Ventas
  const sales = [
    { productId: "prod-1", quantity: 3, unitPrice: 43, date: new Date("2026-02-15") },
    { productId: "prod-6", quantity: 24, unitPrice: 69, date: new Date("2026-02-14") },
    { productId: "prod-6", quantity: 3, unitPrice: 69, date: new Date("2026-02-13") },
    { productId: "prod-5", quantity: 6, unitPrice: 42, date: new Date("2026-02-10") },
    { productId: "prod-5", quantity: 1, unitPrice: 42, date: new Date("2026-02-08") },
    { productId: "prod-6", quantity: 10, unitPrice: 85, date: new Date("2026-01-28") },
    { productId: "prod-3", quantity: 5, unitPrice: 90, date: new Date("2026-01-20") },
    { productId: "prod-1", quantity: 8, unitPrice: 43, date: new Date("2026-01-15") },
    { productId: "prod-2", quantity: 2, unitPrice: 85, date: new Date("2025-12-18") },
    { productId: "prod-4", quantity: 4, unitPrice: 96, date: new Date("2025-12-10") },
    { productId: "prod-5", quantity: 12, unitPrice: 42, date: new Date("2025-11-22") },
    { productId: "prod-1", quantity: 6, unitPrice: 43, date: new Date("2025-11-05") },
    { productId: "prod-3", quantity: 3, unitPrice: 90, date: new Date("2025-10-15") },
    { productId: "prod-6", quantity: 15, unitPrice: 85, date: new Date("2025-10-08") },
    { productId: "prod-2", quantity: 1, unitPrice: 100, date: new Date("2025-09-20") },
  ];

  // Limpiar ventas existentes y reinsertar
  await prisma.sale.deleteMany({ where: { tenantId: tenant.id } });
  for (const s of sales) {
    await prisma.sale.create({
      data: { ...s, total: s.quantity * s.unitPrice, userId: profile.id, tenantId: tenant.id },
    });
  }
  console.log(`✅ ${sales.length} ventas`);

  // 6. Compras
  const purchases = [
    { productId: "prod-6", quantity: 100, unitCost: 50, supplier: "Sony Ecuador", date: new Date("2026-02-01") },
    { productId: "prod-6", quantity: 16, unitCost: 50, date: new Date("2026-01-15") },
    { productId: "prod-6", quantity: 13, unitCost: 50, date: new Date("2025-12-20") },
  ];

  await prisma.purchase.deleteMany({ where: { tenantId: tenant.id } });
  for (const p of purchases) {
    await prisma.purchase.create({
      data: { ...p, total: p.quantity * p.unitCost, tenantId: tenant.id },
    });
  }
  console.log(`✅ ${purchases.length} compras`);

  // 7. Pedidos
  const orders = [
    { clientName: "Carlos Méndez", clientEmail: "carlos@email.com", deliveryAddress: "Guayaquil, Ecuador", subtotal: 120, total: 120, status: "pendiente", date: new Date("2026-02-15") },
    { clientName: "JuanFelipe Soto", deliveryAddress: "Guayaquil", subtotal: 715, total: 715, status: "pagado", date: new Date("2026-02-14") },
    { clientName: "Carlos Méndez", deliveryAddress: "Guayaquil, Ecuador", subtotal: 43, total: 43, status: "entregado", date: new Date("2026-02-13") },
    { clientName: "María López", deliveryAddress: "Guayaquil, Ecuador", subtotal: 156, total: 156, status: "entregado", date: new Date("2026-02-12") },
    { clientName: "María López", deliveryAddress: "Guayaquil, Ecuador", subtotal: 270, total: 270, status: "entregado", date: new Date("2026-02-11") },
    { clientName: "Carlos Méndez", deliveryAddress: "Guayaquil, Ecuador", subtotal: 45, total: 45, status: "entregado", date: new Date("2026-02-10") },
  ];

  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({ where: { tenantId: tenant.id } });
  for (const o of orders) {
    await prisma.order.create({ data: { ...o, shipping: 0, tenantId: tenant.id } });
  }
  console.log(`✅ ${orders.length} pedidos`);

  console.log("\n🎉 ¡Base de datos sembrada exitosamente!");
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
