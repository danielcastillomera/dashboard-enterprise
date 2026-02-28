"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, ArrowRight, Package, ShoppingCart, FileText, Users, BarChart3, Settings, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { mockProducts, mockOrders, mockSales } from "@/lib/mock-data";
import { getActiveTenantConfig, formatCurrency } from "@/lib/tenant-config";

/* ============================================
   GLOBAL SEARCH — ENTERPRISE
   Estándar: Stripe Command Bar, Shopify Search, 
   Linear Command+K, Vercel Command Menu
   
   Funcionalidades:
   - Búsqueda en productos, pedidos, clientes
   - Navegación rápida a módulos
   - Atajos de teclado (Ctrl+K / Cmd+K)
   - Resultados agrupados por categoría
   - Keyboard navigation (↑↓ Enter Esc)
   ============================================ */

interface SearchResult {
  id: string;
  label: string;
  description?: string;
  category: "producto" | "pedido" | "pagina" | "accion";
  icon: React.ReactNode;
  href?: string;
  action?: () => void;
}

const pages: SearchResult[] = [
  { id: "nav-panel", label: "Panel de Control", category: "pagina", icon: <LayoutDashboard size={16} />, href: "/panel" },
  { id: "nav-ventas", label: "Módulo de Ventas", category: "pagina", icon: <ShoppingCart size={16} />, href: "/ventas" },
  { id: "nav-compras", label: "Módulo de Compras", category: "pagina", icon: <FileText size={16} />, href: "/compras" },
  { id: "nav-inventario", label: "Inventario", category: "pagina", icon: <Package size={16} />, href: "/inventario" },
  { id: "nav-pedidos", label: "Gestión de Pedidos", category: "pagina", icon: <Users size={16} />, href: "/pedidos" },
  { id: "nav-productos", label: "Administrar Productos", category: "pagina", icon: <Package size={16} />, href: "/productos" },
  { id: "nav-reportes", label: "Reportes", category: "pagina", icon: <BarChart3 size={16} />, href: "/reportes" },
  { id: "nav-config", label: "Configuración", category: "pagina", icon: <Settings size={16} />, href: "/configuracion" },
];

export function GlobalSearch() {
  const config = getActiveTenantConfig();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Ctrl+K / Cmd+K para abrir
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input cuando se abre
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Buscar resultados
  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return pages;
    const q = query.toLowerCase();

    const productResults: SearchResult[] = mockProducts
      .filter((p) => p.name.toLowerCase().includes(q) || (p.brand || "").toLowerCase().includes(q))
      .slice(0, 5)
      .map((p) => ({
        id: `prod-${p.id}`,
        label: p.name,
        description: `${formatCurrency(p.price, config)} · Stock: ${p.stock}`,
        category: "producto",
        icon: <Package size={16} />,
        href: "/productos",
      }));

    const orderResults: SearchResult[] = mockOrders
      .filter((o) => o.clientName.toLowerCase().includes(q) || o.id.toLowerCase().includes(q))
      .slice(0, 5)
      .map((o) => ({
        id: `ord-${o.id}`,
        label: `Pedido — ${o.clientName}`,
        description: `${formatCurrency(o.total, config)} · ${o.status.toUpperCase()}`,
        category: "pedido",
        icon: <Users size={16} />,
        href: "/pedidos",
      }));

    const pageResults = pages.filter((p) => p.label.toLowerCase().includes(q));

    return [...pageResults, ...productResults, ...orderResults];
  }, [query, config]);

  // Reset active index cuando cambian resultados
  useEffect(() => { setActiveIndex(0); }, [results]);

  function handleSelect(result: SearchResult) {
    if (result.href) router.push(result.href);
    if (result.action) result.action();
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    }
  }

  // Scroll activo a la vista
  useEffect(() => {
    if (resultsRef.current) {
      const active = resultsRef.current.querySelector(`[data-index="${activeIndex}"]`);
      active?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  // Agrupar por categoría
  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    results.forEach((r) => {
      if (!groups[r.category]) groups[r.category] = [];
      groups[r.category].push(r);
    });
    return groups;
  }, [results]);

  const categoryLabels: Record<string, string> = {
    pagina: "Páginas",
    producto: "Productos",
    pedido: "Pedidos",
    accion: "Acciones",
  };

  let globalIndex = -1;

  return (
    <>
      {/* Trigger — Barra de búsqueda en el header */}
      <button
        onClick={() => setOpen(true)}
        className="relative flex-1 max-w-md flex items-center gap-2 px-3 py-2 text-sm rounded-xl
          bg-[var(--color-dashboard-surface)]
          border border-[var(--color-dashboard-border)]
          text-[var(--color-text-muted)]
          hover:border-[var(--color-brand-500)]/50
          transition-colors cursor-text"
        aria-label="Buscar en el dashboard (Ctrl+K)"
      >
        <Search size={16} />
        <span className="flex-1 text-left">Buscar productos, pedidos...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] text-[10px] font-mono text-[var(--color-text-muted)]">
          Ctrl K
        </kbd>
      </button>

      {/* Modal de búsqueda */}
      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Búsqueda global">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setOpen(false); setQuery(""); }} />

          {/* Panel de búsqueda */}
          <div className="relative top-[15%] mx-auto w-full max-w-lg">
            <div className="rounded-2xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] shadow-2xl overflow-hidden">
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-dashboard-border)]">
                <Search size={18} className="text-[var(--color-text-muted)] flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Buscar productos, pedidos, páginas..."
                  className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none"
                  aria-label="Buscar"
                  autoComplete="off"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                    <X size={16} />
                  </button>
                )}
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] text-[10px] font-mono text-[var(--color-text-muted)]">
                  ESC
                </kbd>
              </div>

              {/* Resultados */}
              <div ref={resultsRef} className="max-h-80 overflow-y-auto py-2">
                {results.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-[var(--color-text-muted)]">No se encontraron resultados para &ldquo;{query}&rdquo;</p>
                  </div>
                ) : (
                  Object.entries(grouped).map(([category, items]) => (
                    <div key={category}>
                      <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                        {categoryLabels[category] || category}
                      </p>
                      {items.map((item) => {
                        globalIndex++;
                        const idx = globalIndex;
                        return (
                          <button
                            key={item.id}
                            data-index={idx}
                            onClick={() => handleSelect(item)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                              ${idx === activeIndex
                                ? "bg-[var(--color-brand-500)]/10 text-[var(--color-brand-500)]"
                                : "text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)]"
                              }`}
                          >
                            <span className={idx === activeIndex ? "text-[var(--color-brand-500)]" : "text-[var(--color-text-muted)]"}>
                              {item.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.label}</p>
                              {item.description && (
                                <p className="text-xs text-[var(--color-text-muted)] truncate">{item.description}</p>
                              )}
                            </div>
                            {idx === activeIndex && <ArrowRight size={14} className="flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer con atajos */}
              <div className="flex items-center gap-4 px-4 py-2 border-t border-[var(--color-dashboard-border)] text-[10px] text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] font-mono">↑↓</kbd> Navegar</span>
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] font-mono">Enter</kbd> Seleccionar</span>
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] font-mono">Esc</kbd> Cerrar</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
