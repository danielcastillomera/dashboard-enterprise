"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getActiveTenantConfig, getEnabledModules } from "@/lib/tenant-config";
import {
  Home, ShoppingCart, Package, Boxes, Truck,
  Tag, BarChart3, Settings, X,
} from "lucide-react";

/* ============================================
   SIDEBAR ENTERPRISE
   Estándar: Shopify Admin, Stripe Dashboard
   - Brand/logo arriba
   - Navegación por módulos
   - Sin info de usuario (eso va en el header)
   - Collapsible en móvil
   ============================================ */

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Home, ShoppingCart, Package, Boxes, Truck, Tag, BarChart3, Settings,
};

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const config = getActiveTenantConfig();
  const modules = getEnabledModules(config);

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-60 flex flex-col
        bg-[var(--color-dashboard-sidebar)] border-r border-[var(--color-dashboard-border)]
        transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      aria-label="Navegación principal"
    >
      {/* Brand / Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-[var(--color-dashboard-border)]">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-[var(--color-dashboard-bg)]"
            style={{ backgroundColor: config.brandColor }}
            aria-hidden="true"
          >
            {config.name.charAt(0)}
          </div>
          <div>
            <p className="text-[var(--color-text-primary)] font-bold text-sm leading-tight">
              {config.name}
            </p>
            <p className="text-[var(--color-text-muted)] text-xs">
              Sistema de Gestión
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-lg"
          aria-label="Cerrar menú"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto" aria-label="Menú del dashboard">
        {modules.map((module) => {
          const Icon = iconMap[module.icon] || Home;
          const isActive = pathname === module.path;

          return (
            <Link
              key={module.id}
              href={module.path}
              onClick={onClose}
              aria-current={isActive ? "page" : undefined}
              className={`
                flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-xl
                text-sm font-medium transition-colors duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)] focus-visible:ring-offset-2
                ${
                  isActive
                    ? "text-[var(--color-brand-500)] bg-[var(--color-brand-500)]/10"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface)]"
                }
              `}
            >
              <Icon size={20} />
              <span>{module.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer del sidebar */}
      <div className="px-4 py-3 border-t border-[var(--color-dashboard-border)]">
        <p className="text-[10px] text-[var(--color-text-muted)] text-center">
          Sistema de Gestión v1.0
        </p>
      </div>
    </aside>
  );
}
