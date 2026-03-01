"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Package, ChevronDown, X } from "lucide-react";
import { getActiveTenantConfig, formatCurrency } from "@/lib/tenant-config";

/* ============================================
   PRODUCT SELECTOR — Enterprise
   
   Dropdown con:
   - Búsqueda en tiempo real
   - Imagen del producto
   - Precio y stock visible
   - Indicadores de estado (agotado, bajo stock)
   ============================================ */

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  brand?: string;
  images?: string[];
  isActive: boolean;
}

interface ProductSelectorProps {
  products: Product[];
  selected: Product | null;
  onSelect: (product: Product | null) => void;
  label?: string;
  priceField?: "price" | "cost";
  placeholder?: string;
  disabled?: boolean;
}

export function ProductSelector({
  products,
  selected,
  onSelect,
  label = "Producto",
  priceField = "price",
  placeholder = "Buscar producto...",
  disabled = false,
}: ProductSelectorProps) {
  const config = getActiveTenantConfig();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar productos activos con stock > 0
  const filtered = useMemo(() => {
    const available = products.filter((p) => p.isActive && p.stock > 0);
    if (!search.trim()) return available;
    const q = search.toLowerCase();
    return available.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q)
    );
  }, [products, search]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(product: Product) {
    onSelect(product);
    setSearch("");
    setOpen(false);
  }

  function handleClear() {
    onSelect(null);
    setSearch("");
  }

  function handleOpen() {
    if (disabled) return;
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
        {label} *
      </label>

      {/* Selected product display or trigger */}
      {selected && !open ? (
        <div
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg border border-[var(--color-dashboard-border)] bg-[var(--color-dashboard-surface)] cursor-pointer hover:border-[var(--color-brand-500)] transition-colors"
          onClick={handleOpen}
        >
          <ProductThumb product={selected} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{selected.name}</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">
              {selected.brand || "Sin marca"} · Stock: {selected.stock} · {formatCurrency(selected[priceField], config)}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleClear(); }}
            className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-status-error)] hover:bg-[var(--color-status-error)]/10 transition-colors"
            aria-label="Cambiar producto"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg border bg-[var(--color-dashboard-surface)] transition-colors ${
            open
              ? "border-[var(--color-brand-500)] ring-1 ring-[var(--color-brand-500)]/30"
              : "border-[var(--color-dashboard-border)] hover:border-[var(--color-brand-500)]/50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onClick={handleOpen}
        >
          <Search size={14} className="text-[var(--color-text-muted)] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setOpen(true)}
            disabled={disabled}
            className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
          />
          <ChevronDown
            size={14}
            className={`text-[var(--color-text-muted)] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] shadow-lg overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <Package size={20} className="mx-auto mb-1 text-[var(--color-text-muted)]" />
                <p className="text-xs text-[var(--color-text-muted)]">
                  {search ? "No se encontraron productos" : "No hay productos disponibles"}
                </p>
              </div>
            ) : (
              filtered.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSelect(product)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[var(--color-dashboard-surface-hover)] transition-colors border-b border-[var(--color-dashboard-border)] last:border-b-0 ${
                    selected?.id === product.id ? "bg-[var(--color-brand-500)]/5" : ""
                  }`}
                >
                  <ProductThumb product={product} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {product.name}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      {product.brand || "Sin marca"}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-[var(--color-brand-500)]">
                      {formatCurrency(product[priceField], config)}
                    </p>
                    <p className={`text-[10px] font-medium ${
                      product.stock <= product.minStock
                        ? "text-[var(--color-status-warning)]"
                        : "text-[var(--color-text-muted)]"
                    }`}>
                      Stock: {product.stock}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductThumb({ product }: { product: Product }) {
  const hasImage = product.images && product.images.length > 0 && product.images[0] !== "";

  if (hasImage) {
    return (
      <img
        src={product.images![0]}
        alt={product.name}
        className="w-9 h-9 rounded-lg object-cover border border-[var(--color-dashboard-border)] flex-shrink-0"
      />
    );
  }

  return (
    <div className="w-9 h-9 rounded-lg bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] flex items-center justify-center flex-shrink-0">
      <Package size={14} className="text-[var(--color-text-muted)]" />
    </div>
  );
}
