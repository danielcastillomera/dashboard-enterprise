"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, RefreshCw, Image } from "lucide-react";
import { PageHeader, Card, Badge, Button, FilterBar, DataTable, type Column } from "@/components/ui";
import { getActiveTenantConfig, formatCurrency } from "@/lib/tenant-config";
import { mockProducts, mockCategories } from "@/lib/mock-data";
import type { Product } from "@/types";

export default function ProductosPage() {
  const config = getActiveTenantConfig();
  const [filter, setFilter] = useState("Todos");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "", description: "", price: "", cost: "", stock: "", minStock: "", categoryId: "", brand: "", color: "", isOffer: false, offerPrice: "",
  });

  const filtered = filter === "Todos"
    ? mockProducts
    : filter === "Activos"
      ? mockProducts.filter((p) => p.isActive)
      : filter === "Ofertas"
        ? mockProducts.filter((p) => p.isOffer)
        : mockProducts.filter((p) => p.stock === 0);

  function openNew() {
    setEditingProduct(null);
    setFormData({ name: "", description: "", price: "", cost: "", stock: "", minStock: "", categoryId: "", brand: "", color: "", isOffer: false, offerPrice: "" });
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditingProduct(p);
    setFormData({
      name: p.name, description: p.description || "", price: String(p.price), cost: String(p.cost),
      stock: String(p.stock), minStock: String(p.minStock), categoryId: p.categoryId,
      brand: p.brand || "", color: p.color || "", isOffer: p.isOffer, offerPrice: p.offerPrice ? String(p.offerPrice) : "",
    });
    setShowForm(true);
  }

  const inputClass = "px-3 py-2 rounded-lg text-sm bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-500)] w-full";

  const columns: Column<Product>[] = [
    {
      key: "product",
      header: "PRODUCTO",
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] flex items-center justify-center">
            <Image size={16} className="text-[var(--color-text-muted)]" />
          </div>
          <div>
            <p className="text-[var(--color-text-primary)] font-medium text-sm">{p.name}</p>
            <p className="text-[var(--color-text-muted)] text-xs">{p.brand}</p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "PRECIO",
      render: (p) => <span className="text-[var(--color-text-primary)] font-semibold">{formatCurrency(p.price, config)}</span>,
    },
    {
      key: "stock",
      header: "STOCK",
      render: (p) => (
        <span className={`font-semibold ${p.stock === 0 ? "text-[var(--color-status-error)]" : p.stock <= p.minStock ? "text-[var(--color-status-warning)]" : "text-[var(--color-status-success)]"}`}>
          {p.stock}
        </span>
      ),
    },
    {
      key: "offer",
      header: "OFERTA",
      render: (p) => p.isOffer
        ? <Badge variant="warning">{formatCurrency(p.offerPrice || 0, config)}</Badge>
        : <span className="text-[var(--color-text-muted)] text-xs">—</span>,
    },
    {
      key: "status",
      header: "ESTADO",
      render: (p) => <Badge variant={p.isActive ? "success" : "default"}>{p.isActive ? "ACTIVO" : "INACTIVO"}</Badge>,
    },
    {
      key: "actions",
      header: "ACCIONES",
      render: (p) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(p)} aria-label={`Editar ${p.name}`}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-status-info)] hover:bg-[var(--color-status-info)]/10 transition-colors">
            <Pencil size={14} />
          </button>
          <button aria-label={`Eliminar ${p.name}`}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-status-error)] hover:bg-[var(--color-status-error)]/10 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Administrar Catálogo"
        description={`${mockProducts.length} productos registrados`}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />}>Actualizar</Button>
            <Button size="sm" icon={<Plus size={14} />} onClick={openNew}>Agregar Producto</Button>
          </div>
        }
      />

      {/* Formulario agregar/editar */}
      {showForm && (
        <Card className="mb-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              {editingProduct ? `Editar: ${editingProduct.name}` : "Registrar Nuevo Producto"}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">Cancelar</button>
          </div>

          {/* Multimedia placeholder */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {["Principal", "Opcional", "Opcional", "Opcional"].map((label, i) => (
              <div key={i} className="aspect-square rounded-lg border-2 border-dashed border-[var(--color-dashboard-border)] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[var(--color-brand-500)]/50 transition-colors">
                <Image size={20} className="text-[var(--color-text-muted)]" />
                <span className="text-[9px] text-[var(--color-text-muted)]">{label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Nombre del Producto</label>
              <input placeholder="Ej: Taladro Eléctrico" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Categoría</label>
              <select value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})} className={inputClass}>
                <option value="">Seleccionar...</option>
                {mockCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Cantidad Inicial</label>
              <input placeholder="0" type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Precio Compra</label>
              <input placeholder="0.00" type="number" step="0.01" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Precio Venta</label>
              <input placeholder="0.00" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Precio Oferta</label>
              <input placeholder="0.00" type="number" step="0.01" value={formData.offerPrice} onChange={(e) => setFormData({...formData, offerPrice: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Marca</label>
              <input placeholder="Ej: DeWalt" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Color</label>
              <input placeholder="Ej: Amarillo" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Stock Mínimo</label>
              <input placeholder="5" type="number" value={formData.minStock} onChange={(e) => setFormData({...formData, minStock: e.target.value})} className={inputClass} />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Descripción</label>
            <textarea placeholder="Descripción del producto..." rows={2} value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className={`${inputClass} resize-none`} />
          </div>

          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] cursor-pointer">
              <input type="checkbox" checked={formData.isOffer} onChange={(e) => setFormData({...formData, isOffer: e.target.checked})}
                className="w-4 h-4 rounded border-[var(--color-dashboard-border)]" />
              Oferta
            </label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button size="sm">{editingProduct ? "Guardar Cambios" : "Registrar Producto"}</Button>
          </div>
        </Card>
      )}

      <FilterBar filters={["Todos", "Activos", "Ofertas", "Agotados"]} active={filter} onFilter={setFilter} />

      <DataTable columns={columns} data={filtered} emptyMessage="No hay productos con estos filtros" />
    </div>
  );
}
