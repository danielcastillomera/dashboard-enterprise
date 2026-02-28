import { TenantConfig, ModuleConfig } from "@/types";

/* ============================================
   CONFIGURACIÓN DEL TENANT / NEGOCIO
   
   CORAZÓN de la plantilla. Cada cliente nuevo
   solo requiere modificar este archivo.
   Estándares: Stripe, Shopify, AWS Console.
   ============================================ */

const ALL_MODULES: ModuleConfig[] = [
  { id: "panel", name: "Panel de Control", enabled: true, icon: "Home", path: "/panel" },
  { id: "ventas", name: "Ventas", enabled: true, icon: "ShoppingCart", path: "/ventas" },
  { id: "compras", name: "Compras", enabled: true, icon: "Package", path: "/compras" },
  { id: "inventario", name: "Inventario", enabled: true, icon: "Boxes", path: "/inventario" },
  { id: "pedidos", name: "Pedidos Online", enabled: true, icon: "Truck", path: "/pedidos" },
  { id: "productos", name: "Productos", enabled: true, icon: "Tag", path: "/productos" },
  { id: "reportes", name: "Reportes", enabled: true, icon: "BarChart3", path: "/reportes" },
  { id: "configuracion", name: "Configuración", enabled: true, icon: "Settings", path: "/configuracion" },
];

/* ============================================
   CONFIGURACIÓN POR DEFECTO — ECUADOR
   ============================================ */
export const defaultTenantConfig: TenantConfig = {
  id: "default",
  name: "Mi Tienda",
  slug: "mi-tienda",
  industry: "general",
  brandColor: "#F59E0B",
  locale: "es-EC",
  currency: "USD",
  currencySymbol: "$",
  timezone: "America/Guayaquil",
  dateFormat: "dd/MM/yyyy",
  modules: ALL_MODULES,
};

/* ============================================
   PLANTILLAS POR INDUSTRIA
   ============================================ */

export const ferreteriaConfig: TenantConfig = {
  ...defaultTenantConfig,
  id: "ferreteria-demo",
  name: "Ferretería El Constructor",
  slug: "ferreteria-constructor",
  industry: "ferreteria",
  brandColor: "#F59E0B",
  modules: ALL_MODULES,
};

export const restauranteConfig: TenantConfig = {
  ...defaultTenantConfig,
  id: "restaurante-demo",
  name: "Restaurante La Cocina",
  slug: "restaurante-cocina",
  industry: "restaurante",
  brandColor: "#EF4444",
  modules: ALL_MODULES.map((m) =>
    m.id === "pedidos"
      ? { ...m, name: "Pedidos / Delivery" }
      : m.id === "inventario"
        ? { ...m, name: "Inventario / Ingredientes" }
        : m
  ),
};

export const ecommerceConfig: TenantConfig = {
  ...defaultTenantConfig,
  id: "ecommerce-demo",
  name: "Tienda Online",
  slug: "tienda-online",
  industry: "ecommerce",
  brandColor: "#3B82F6",
  modules: ALL_MODULES,
};

/* ============================================
   PLANTILLAS POR PAÍS
   ============================================ */

export const ecuadorConfig: Partial<TenantConfig> = {
  locale: "es-EC",
  currency: "USD",
  currencySymbol: "$",
  timezone: "America/Guayaquil",
  dateFormat: "dd/MM/yyyy",
};

export const mexicoConfig: Partial<TenantConfig> = {
  locale: "es-MX",
  currency: "MXN",
  currencySymbol: "$",
  timezone: "America/Mexico_City",
  dateFormat: "dd/MM/yyyy",
};

export const guatemalaConfig: Partial<TenantConfig> = {
  locale: "es-GT",
  currency: "GTQ",
  currencySymbol: "Q",
  timezone: "America/Guatemala",
  dateFormat: "dd/MM/yyyy",
};

export const colombiaConfig: Partial<TenantConfig> = {
  locale: "es-CO",
  currency: "COP",
  currencySymbol: "$",
  timezone: "America/Bogota",
  dateFormat: "dd/MM/yyyy",
};

/* ============================================
   OBTENER CONFIGURACIÓN ACTIVA
   ============================================ */
export function getActiveTenantConfig(): TenantConfig {
  return ferreteriaConfig;
}

/* ============================================
   UTILIDADES
   ============================================ */

export function getEnabledModules(config: TenantConfig): ModuleConfig[] {
  return config.modules.filter((m) => m.enabled);
}

/** Formato de moneda usando Intl.NumberFormat (estándar Stripe/Shopify) */
export function formatCurrency(amount: number, config: TenantConfig): string {
  try {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${config.currencySymbol} ${amount.toFixed(2)}`;
  }
}

/** Formato de fecha usando Intl.DateTimeFormat */
export function formatDate(date: Date, config: TenantConfig): string {
  try {
    return new Intl.DateTimeFormat(config.locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: config.timezone,
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

/** Formato de fecha con hora */
export function formatDateTime(date: Date, config: TenantConfig): string {
  try {
    return new Intl.DateTimeFormat(config.locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: config.timezone,
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

export function isModuleEnabled(config: TenantConfig, moduleId: string): boolean {
  return config.modules.some((m) => m.id === moduleId && m.enabled);
}
