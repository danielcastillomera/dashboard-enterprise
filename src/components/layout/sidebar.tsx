"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getActiveTenantConfig, getEnabledModules } from "@/lib/tenant-config";
import {
  Home, ShoppingCart, Package, Boxes, Truck,
  Tag, BarChart3, Settings, X, FileText, Users, LogOut,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

/* ============================================
   SIDEBAR ENTERPRISE
   Estándar: Shopify Admin, Stripe Dashboard
   - Brand/logo arriba
   - Navegación por módulos
   - Sin info de usuario (eso va en el header)
   - Collapsible en móvil
   ============================================ */

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Home, ShoppingCart, Package, Boxes, Truck, Tag, BarChart3, Settings, FileText, Users,
};

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const config = getActiveTenantConfig();
  const modules = getEnabledModules(config);

  // Import guard safely (may not be in context during SSR)
  let confirmLeave: (() => Promise<boolean>) | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const guard = require("@/components/ui/unsaved-guard").useUnsavedGuard();
    confirmLeave = guard.confirmLeave;
  } catch { /* Guard not available */ }

  const handleNavClick = async (e: React.MouseEvent, path: string) => {
    if (pathname === path) return; // Same page, no guard needed
    if (confirmLeave) {
      e.preventDefault();
      const canLeave = await confirmLeave();
      if (canLeave) {
        router.push(path);
        onClose();
      }
    }
  };

  return (
    <aside
      data-tour="sidebar"
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
              onClick={(e) => handleNavClick(e, module.path)}
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
      <div className="px-3 py-3 border-t border-[var(--color-dashboard-border)] space-y-1">
        <form className="lg:hidden">
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await fetch("/api/auth/logout", { method: "POST" });
                if (res.ok) window.location.href = "/login";
              } catch {
                window.location.href = "/login";
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--color-status-error)] hover:bg-[var(--color-status-error)]/10 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={18} /> Cerrar sesión
          </button>
        </form>
        <p className="text-[10px] text-[var(--color-text-muted)] text-center pt-1">
          Sistema de Gestión v3.2.0
        </p>
      </div>
    </aside>
  );
}
