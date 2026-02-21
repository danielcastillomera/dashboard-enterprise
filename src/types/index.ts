/* ============================================
   TIPOS GLOBALES DEL DASHBOARD ENTERPRISE
   Plantilla adaptable multi-industria
   Estándares: Stripe, Shopify, AWS Console
   ============================================ */

// ---- Configuración del Tenant/Negocio ----
export interface TenantConfig {
  id: string;
  name: string;
  slug: string;
  industry: IndustryType;
  logo?: string;
  brandColor: string;
  // Localización
  locale: string;         // es-EC, es-MX, en-US
  currency: string;       // ISO 4217: USD, EUR, MXN
  currencySymbol: string;
  timezone: string;       // IANA: America/Guayaquil
  dateFormat: string;     // dd/MM/yyyy
  // Módulos
  modules: ModuleConfig[];
}

export type IndustryType =
  | "ferreteria"
  | "ecommerce"
  | "restaurante"
  | "calzado"
  | "ropa"
  | "tecnologia"
  | "farmacia"
  | "libreria"
  | "general";

export interface ModuleConfig {
  id: string;
  name: string;
  enabled: boolean;
  icon: string;
  path: string;
}

// ---- Usuarios ----
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  avatarUrl?: string;
  createdAt: Date;
}

export type UserRole = "super-admin" | "admin" | "manager" | "viewer";

// ---- Productos ----
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  categoryId: string;
  images: string[];
  isActive: boolean;
  isOffer: boolean;
  offerPrice?: number;
  brand?: string;
  color?: string;
  tags: string[];
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---- Categorías ----
export interface Category {
  id: string;
  name: string;
  tenantId: string;
}

// ---- Ventas ----
export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  date: Date;
  userId: string;
  tenantId: string;
}

// ---- Compras ----
export interface Purchase {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
  supplier?: string;
  date: Date;
  tenantId: string;
}

// ---- Pedidos ----
export interface Order {
  id: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  deliveryAddress?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  date: Date;
  tenantId: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export type OrderStatus =
  | "pendiente"
  | "pagado"
  | "enviado"
  | "entregado"
  | "cancelado";

// ---- Filtros ----
export interface SavedFilter {
  id: string;
  name: string;
  userId: string;
  module: string;
  config: FilterConfig;
  tenantId: string;
}

export interface FilterConfig {
  dateRange?: { start: string; end: string };
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  customFields?: Record<string, string | number | boolean>;
}

// ---- Dashboard KPIs ----
export interface DashboardKPI {
  label: string;
  value: string | number;
  icon: string;
  trend?: number;
  color?: string;
}

// ---- Reportes ----
export type ChartType =
  | "bar"
  | "bar-horizontal"
  | "line"
  | "area"
  | "pie"
  | "donut"
  | "stacked-bar"
  | "mixed";

export interface ReportConfig {
  id: string;
  title: string;
  chartType: ChartType;
  dataSource: string;
  filters: FilterConfig;
}

// ---- Navegación ----
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: string;
  children?: NavItem[];
}
