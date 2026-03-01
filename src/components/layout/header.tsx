"use client";

import { Menu, Bell, LogOut, ChevronDown, Settings, AlertTriangle, Package, ShoppingCart, Check, X, CheckCheck, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GlobalSearch } from "@/components/layout/global-search";
import { logoutAction } from "@/lib/actions/auth";
import { useRealtimeNotifications, type Notification } from "@/lib/hooks/use-realtime-notifications";
import Link from "next/link";

/* ============================================
   HEADER ENTERPRISE — REALTIME NOTIFICATIONS
   
   - Notificaciones en tiempo real via Supabase
   - Se actualizan automáticamente sin recargar
   - Triggers de BD generan notificaciones para:
     · Nuevos pedidos
     · Stock bajo / agotado
     · Ventas registradas
   ============================================ */

const typeIcons: Record<string, React.ReactNode> = {
  warning: <AlertTriangle size={16} className="text-amber-500" />,
  info: <ShoppingCart size={16} className="text-blue-500" />,
  success: <Check size={16} className="text-green-500" />,
  order: <Package size={16} className="text-[var(--color-brand-500)]" />,
  error: <X size={16} className="text-red-500" />,
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  
  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Hace ${diffDays}d`;
  
  return date.toLocaleDateString("es-EC", { day: "numeric", month: "short" });
}

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading: notifLoading,
    markAsRead,
    markAllRead,
    dismiss,
    clearAll,
  } = useRealtimeNotifications();

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
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

      {/* Búsqueda global funcional */}
      <GlobalSearch />

      {/* Controles derecha */}
      <div className="flex items-center gap-1 ml-auto">
        <ThemeToggle />

        {/* === NOTIFICACIONES REALTIME === */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ""}`}
            aria-expanded={notifOpen}
            aria-haspopup="true"
            className="relative p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-dashboard-surface)] transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[var(--color-status-error)] text-white text-[9px] font-bold animate-pulse" aria-hidden="true">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Panel de notificaciones */}
          {notifOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-80 sm:w-96 rounded-xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] shadow-[var(--shadow-dropdown)] z-50 overflow-hidden"
              role="menu"
              aria-label="Panel de notificaciones"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-dashboard-border)]">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                  Notificaciones
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[var(--color-status-error)]/10 text-[var(--color-status-error)] text-[10px] font-bold">
                      {unreadCount} nuevas
                    </span>
                  )}
                  {/* Realtime indicator */}
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" title="Tiempo real activo" />
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[10px] font-semibold text-[var(--color-brand-500)] hover:underline"
                  >
                    <CheckCheck size={11} /> Marcar todo
                  </button>
                )}
              </div>

              {/* Lista */}
              <div className="max-h-80 overflow-y-auto">
                {notifLoading ? (
                  <div className="px-4 py-8 text-center">
                    <Loader2 size={20} className="mx-auto mb-2 text-[var(--color-text-muted)] animate-spin" />
                    <p className="text-xs text-[var(--color-text-muted)]">Cargando...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell size={24} className="mx-auto mb-2 text-[var(--color-text-muted)]" />
                    <p className="text-sm text-[var(--color-text-muted)]">No hay notificaciones</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">Las notificaciones aparecen en tiempo real</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <NotificationItem
                      key={notif.id}
                      notif={notif}
                      onRead={markAsRead}
                      onDismiss={dismiss}
                      onClose={() => setNotifOpen(false)}
                    />
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-[var(--color-dashboard-border)] text-center">
                  <button
                    onClick={() => { clearAll(); setNotifOpen(false); }}
                    className="text-[10px] font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  >
                    Limpiar todas las notificaciones
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-[var(--color-dashboard-border)] mx-1" aria-hidden="true" />

        {/* Avatar + Menú */}
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
              <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight">Administrador</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">admin</p>
            </div>
            <ChevronDown size={14} className="hidden sm:block text-[var(--color-text-muted)]" />
          </button>

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
              <Link
                href="/configuracion"
                role="menuitem"
                onClick={() => setUserMenuOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)] transition-colors"
              >
                <Settings size={14} /> Configuración
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  role="menuitem"
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-status-error)] hover:bg-[var(--color-status-error)]/10 transition-colors"
                >
                  <LogOut size={14} /> Cerrar sesión
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ============================================
   NOTIFICATION ITEM — Sub-component
   ============================================ */
function NotificationItem({
  notif,
  onRead,
  onDismiss,
  onClose,
}: {
  notif: Notification;
  onRead: (id: string) => Promise<void>;
  onDismiss: (id: string) => Promise<void>;
  onClose: () => void;
}) {
  const content = (
    <>
      <p className={`text-xs font-semibold ${!notif.read ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}>
        {notif.title}
      </p>
      <p className="text-[11px] text-[var(--color-text-muted)] truncate">{notif.message}</p>
      <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{timeAgo(notif.created_at)}</p>
    </>
  );

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 border-b border-[var(--color-dashboard-border)] last:border-b-0 transition-colors group
        ${!notif.read ? "bg-[var(--color-brand-500)]/5" : "hover:bg-[var(--color-dashboard-surface-hover)]"}`}
    >
      {/* Icono */}
      <span className="mt-0.5 flex-shrink-0">
        {typeIcons[notif.type] || typeIcons.info}
      </span>

      {/* Contenido */}
      {notif.href ? (
        <Link
          href={notif.href}
          onClick={() => { onRead(notif.id); onClose(); }}
          className="flex-1 min-w-0"
        >
          {content}
        </Link>
      ) : (
        <div className="flex-1 min-w-0 cursor-default" onClick={() => onRead(notif.id)}>
          {content}
        </div>
      )}

      {/* Acciones */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notif.read && (
          <button
            onClick={() => onRead(notif.id)}
            className="p-1 rounded text-[var(--color-text-muted)] hover:text-green-500 hover:bg-green-500/10"
            aria-label="Marcar como leída"
            title="Marcar como leída"
          >
            <Check size={12} />
          </button>
        )}
        <button
          onClick={() => onDismiss(notif.id)}
          className="p-1 rounded text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10"
          aria-label="Eliminar notificación"
          title="Eliminar"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
