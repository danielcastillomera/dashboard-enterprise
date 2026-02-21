"use client";

import { Menu, Search, Bell, LogOut, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { logoutAction } from "@/lib/actions/auth";

/* ============================================
   HEADER ENTERPRISE
   Estándar: Stripe, Shopify, AWS Console
   - Búsqueda global a la izquierda
   - Controles a la derecha: tema, notificaciones, usuario
   - Avatar + nombre + menú dropdown con logout
   ============================================ */

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-[var(--color-dashboard-bg)] border-b border-[var(--color-dashboard-border)]"
      role="banner"
    >
      {/* Hamburguesa - solo móvil */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-dashboard-surface)] transition-colors"
        aria-label="Abrir menú de navegación"
      >
        <Menu size={22} />
      </button>

      {/* Búsqueda global */}
      <div className="relative flex-1 max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
        />
        <input
          type="search"
          placeholder="Buscar productos, pedidos..."
          aria-label="Buscar en el dashboard"
          className="w-full pl-9 pr-4 py-2 text-sm rounded-xl
            bg-[var(--color-dashboard-surface)]
            border border-[var(--color-dashboard-border)]
            text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-muted)]
            focus:outline-none focus:border-[var(--color-brand-500)]
            transition-colors"
        />
      </div>

      {/* Controles derecha — estándar enterprise */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Toggle Dark/Light */}
        <ThemeToggle />

        {/* Notificaciones */}
        <button
          aria-label="Notificaciones"
          className="relative p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-dashboard-surface)] transition-colors"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-status-error)]" aria-hidden="true" />
        </button>

        {/* Separador */}
        <div className="w-px h-6 bg-[var(--color-dashboard-border)] mx-1" aria-hidden="true" />

        {/* Avatar + Nombre + Menú (estándar Stripe/Shopify) */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--color-dashboard-surface)] transition-colors"
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
            aria-label="Menú de usuario"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--color-brand-500)] flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight">
                Administrador
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)]">
                admin
              </p>
            </div>
            <ChevronDown size={14} className="hidden sm:block text-[var(--color-text-muted)]" />
          </button>

          {/* Dropdown menu */}
          {userMenuOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-56 rounded-xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] shadow-[var(--shadow-dropdown)] py-1 z-50"
              role="menu"
              aria-label="Opciones de usuario"
            >
              <div className="px-3 py-2 border-b border-[var(--color-dashboard-border)]">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">Administrador</p>
                <p className="text-xs text-[var(--color-text-muted)]">admin@sistema.com</p>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  role="menuitem"
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-status-error)] hover:bg-[var(--color-status-error)]/10 transition-colors"
                >
                  <LogOut size={14} />
                  Cerrar sesión
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
