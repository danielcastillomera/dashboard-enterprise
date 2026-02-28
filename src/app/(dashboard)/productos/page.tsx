"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Pencil, Trash2, Download, FileText, FileSpreadsheet, Search, ImageIcon, Eye, X, Package, Tag, DollarSign, Box, Palette, Info } from "lucide-react";
import { PageHeader, Card, Badge, Button, FilterBar, DataTable, type Column, ErrorState } from "@/components/ui";
import { FullScreenLoader } from "@/components/ui/fullscreen-loader";
import { useOperationGuard } from "@/components/ui/operation-guard";
import { getActiveTenantConfig, formatCurrency } from "@/lib/tenant-config";
import { useExport } from "@/lib/use-export";
import { useData } from "@/lib/hooks/use-data";
import { useToast } from "@/components/ui";
import { createProductAction, updateProductAction, deleteProductAction } from "@/lib/actions/data";
import type { Product } from "@/types";

export default function ProductosPage() {
  const config = getActiveTenantConfig();
  const { handleExportCSV: exportCSV, handleExportPDF: exportPDF } = useExport();
  const { addToast } = useToast();
  const { startCriticalOperation, endCriticalOperation } = useOperationGuard();
  const [filter, setFilter] = useState("Todos");
  const [showForm, setShowForm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [loaderState, setLoaderState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [loaderMessage, setLoaderMessage] = useState("");
  const [loaderDetail, setLoaderDetail] = useState("");
  const [formData, setFormData] = useState({
    name: "", description: "", price: "", cost: "", stock: "", minStock: "", categoryId: "", brand: "", color: "", isOffer: false, offerPrice: "",
  });

  const { data, isLoading, error, mutate } = useData<{ products: Product[]; categories: { id: string; name: string }[] }>("/api/products");

  const allProducts = data?.products || [];
  const categories = data?.categories || [];

  // Operation guard when form is open with data
  useEffect(() => {
    const hasData = formData.name || formData.price || formData.cost;
    if (showForm && hasData) {
      startCriticalOperation({
        operationName: editingProduct ? `Editar ${editingProduct.name}` : "Registrar Producto",
        returnPath: "/productos",
        onCancel: () => { setShowForm(false); endCriticalOperation(); },
      });
    } else if (!showForm) {
      endCriticalOperation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm, formData.name, formData.price]);

  const filtered = useMemo(() => {
    const base = filter === "Activos" ? allProducts.filter(p => p.isActive)
      : filter === "Ofertas" ? allProducts.filter(p => p.isOffer)
      : filter === "Agotados" ? allProducts.filter(p => p.stock === 0)
      : allProducts;
    return base.filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.brand || "").toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allProducts, filter, searchQuery]);

  // Export
  const exportColumns = [
    { key: "name", header: "Producto" },
    { key: "price", header: "Precio" },
    { key: "cost", header: "Costo" },
    { key: "stock", header: "Stock" },
    { key: "brand", header: "Marca" },
  ];
  function handleExportCSV() {
    exportCSV(filtered as unknown as Record<string, unknown>[], exportColumns, `productos_${new Date().toISOString().split("T")[0]}`);
    setShowExportMenu(false);
  }
  async function handleExportPDF() {
    await exportPDF(filtered as unknown as Record<string, unknown>[], exportColumns, `Catálogo de Productos — ${config.name}`, `productos_${new Date().toISOString().split("T")[0]}`);
    setShowExportMenu(false);
  }

  // Form handlers
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

  async function handleSubmit() {
    if (!formData.name || !formData.categoryId || !formData.price || !formData.cost) {
      addToast({ variant: "error", message: "Complete los campos obligatorios" });
      return;
    }

    setLoaderState("loading");
    setLoaderMessage(editingProduct ? "Guardando Cambios..." : "Registrando Producto...");
    setLoaderDetail(formData.name);

    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost),
      stock: parseInt(formData.stock) || 0,
      minStock: parseInt(formData.minStock) || 5,
      categoryId: formData.categoryId,
      brand: formData.brand || undefined,
      color: formData.color || undefined,
      isOffer: formData.isOffer,
      offerPrice: formData.offerPrice ? parseFloat(formData.offerPrice) : undefined,
    };

    const result = editingProduct
      ? await updateProductAction(editingProduct.id, payload)
      : await createProductAction(payload);

    if (result.success) {
      setLoaderState("success");
      setLoaderMessage(editingProduct ? "¡Cambios Guardados!" : "¡Producto Registrado!");
      setLoaderDetail(formData.name);
    } else {
      setLoaderState("error");
      setLoaderMessage("Error");
      setLoaderDetail(result.message);
    }
  }

  function handleLoaderClose() {
    if (loaderState === "success") {
      setShowForm(false);
      endCriticalOperation();
      mutate();
    }
    setLoaderState("idle");
    setLoaderMessage("");
    setLoaderDetail("");
  }

  async function handleDelete(p: Product) {
    if (!confirm(`¿Desactivar "${p.name}"?`)) return;
    const result = await deleteProductAction(p.id);
    if (result.success) {
      addToast({ variant: "success", message: result.message });
      mutate();
    } else {
      addToast({ variant: "error", message: result.message });
    }
  }

  // Product thumbnail
  function ProductImage({ product, size = "sm" }: { product: Product; size?: "sm" | "md" | "lg" }) {
    const sizeClasses = size === "lg" ? "w-48 h-48" : size === "md" ? "w-20 h-20" : "w-10 h-10";
    const iconSize = size === "lg" ? 48 : size === "md" ? 24 : 16;
    const hasImage = product.images && product.images.length > 0 && product.images[0] !== "";

    if (hasImage) {
      return (
        <img
          src={product.images[0]}
          alt={product.name}
          className={`${sizeClasses} rounded-lg object-cover border border-[var(--color-dashboard-border)]`}
        />
      );
    }

    return (
      <div className={`${sizeClasses} rounded-lg bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] flex items-center justify-center`}>
        <Package size={iconSize} className="text-[var(--color-text-muted)]" />
      </div>
    );
  }

  // Category name helper
  function getCategoryName(categoryId: string) {
    return categories.find(c => c.id === categoryId)?.name || "Sin categoría";
  }

  const inputClass = "px-3 py-2 rounded-lg text-sm bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-500)] w-full";

  // Table columns
  const columns: Column<Product>[] = [
    {
      key: "product",
      header: "PRODUCTO",
      render: (p) => (
        <div className="flex items-center gap-3">
          <ProductImage product={p} size="sm" />
          <div>
            <p className="text-[var(--color-text-primary)] font-medium text-sm">{p.name}</p>
            <p className="text-[var(--color-text-muted)] text-xs">{p.brand || "Sin marca"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "CATEGORÍA",
      render: (p) => (
        <span className="text-xs text-[var(--color-text-secondary)]">{getCategoryName(p.categoryId)}</span>
      ),
    },
    {
      key: "price",
      header: "PRECIO",
      render: (p) => (
        <div>
          <span className="text-[var(--color-text-primary)] font-semibold">{formatCurrency(p.price, config)}</span>
          {p.isOffer && p.offerPrice && (
            <span className="block text-xs text-[var(--color-status-warning)]">{formatCurrency(p.offerPrice, config)} oferta</span>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      header: "STOCK",
      render: (p) => (
        <span className={`font-semibold ${p.stock === 0 ? "text-[var(--color-status-error)]" : p.stock <= p.minStock ? "text-[var(--color-status-warning)]" : "text-[var(--color-status-success)]"}`}>
          {p.stock} <span className="text-xs font-normal text-[var(--color-text-muted)]">/ mín {p.minStock}</span>
        </span>
      ),
    },
    {
      key: "status",
      header: "ESTADO",
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          <Badge variant={p.isActive ? "success" : "default"}>{p.isActive ? "ACTIVO" : "INACTIVO"}</Badge>
          {p.isOffer && <Badge variant="warning">OFERTA</Badge>}
        </div>
      ),
    },
    {
      key: "actions",
      header: "ACCIONES",
      render: (p) => (
        <div className="flex gap-1">
          <button onClick={() => setViewingProduct(p)} aria-label={`Ver detalles de ${p.name}`}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-brand-500)] hover:bg-[var(--color-brand-500)]/10 transition-colors"
            title="Ver detalles">
            <Eye size={14} />
          </button>
          <button onClick={() => openEdit(p)} aria-label={`Editar ${p.name}`}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-status-info)] hover:bg-[var(--color-status-info)]/10 transition-colors"
            title="Editar">
            <Pencil size={14} />
          </button>
          <button onClick={() => handleDelete(p)} aria-label={`Eliminar ${p.name}`}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-status-error)] hover:bg-[var(--color-status-error)]/10 transition-colors"
            title="Desactivar">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  if (error) return <ErrorState message={error} onRetry={mutate} />;

  return (
    <div>
      <PageHeader
        title="Administrar Catálogo"
        description={`${filtered.length} de ${allProducts.length} productos`}
        actions={
          <div className="flex gap-2">
            <div className="relative">
              <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={() => setShowExportMenu(!showExportMenu)}>Exportar</Button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] shadow-lg py-1 z-50">
                  <button onClick={handleExportCSV} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)] transition-colors">
                    <FileSpreadsheet size={14} className="text-green-500" /> Exportar CSV
                  </button>
                  <button onClick={handleExportPDF} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)] transition-colors">
                    <FileText size={14} className="text-red-500" /> Exportar PDF
                  </button>
                </div>
              )}
            </div>
            <Button size="sm" icon={<Plus size={14} />} onClick={openNew}>Agregar Producto</Button>
          </div>
        }
      />

      {/* Búsqueda */}
      <div className="relative max-w-sm mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          type="text" placeholder="Buscar producto o marca..."
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Buscar producto"
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-500)]"
        />
      </div>

      {/* Formulario agregar/editar */}
      {showForm && (
        <Card className="mb-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              {editingProduct ? `Editar: ${editingProduct.name}` : "Registrar Nuevo Producto"}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">Cancelar</button>
          </div>

          {/* Multimedia */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2">Imágenes del Producto</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {["Principal", "Opcional", "Opcional", "Opcional"].map((label, i) => (
                <div key={i} className="aspect-square rounded-lg border-2 border-dashed border-[var(--color-dashboard-border)] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[var(--color-brand-500)]/50 transition-colors group">
                  <ImageIcon size={24} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-500)] transition-colors" />
                  <span className="text-[10px] text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-500)]">{label}</span>
                  <span className="text-[9px] text-[var(--color-text-muted)]">Clic para subir</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Nombre del Producto *</label>
              <input placeholder="Ej: Taladro Eléctrico" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Categoría *</label>
              <select value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})} className={inputClass}>
                <option value="">Seleccionar...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Cantidad Inicial</label>
              <input placeholder="0" type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Precio Compra *</label>
              <input placeholder="0.00" type="number" step="0.01" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Precio Venta *</label>
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
              Marcar como Oferta
            </label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSubmit}>{editingProduct ? "Guardar Cambios" : "Registrar Producto"}</Button>
          </div>
        </Card>
      )}

      <FilterBar filters={["Todos", "Activos", "Ofertas", "Agotados"]} active={filter} onFilter={setFilter} />

      <DataTable columns={columns} data={filtered} isLoading={isLoading} emptyMessage="No hay productos con estos filtros" caption="Catálogo de productos" />

      {/* ========== MODAL: DETALLE DEL PRODUCTO ========== */}
      {viewingProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewingProduct(null)} />

          {/* Modal */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[var(--color-dashboard-border)] bg-[var(--color-dashboard-surface)]">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Detalle del Producto</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => { setViewingProduct(null); openEdit(viewingProduct); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-brand-500)] border border-[var(--color-brand-500)] hover:bg-[var(--color-brand-500)]/10 transition-colors"
                >
                  <Pencil size={12} /> Editar
                </button>
                <button onClick={() => setViewingProduct(null)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)] transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Image gallery + basic info */}
              <div className="flex flex-col sm:flex-row gap-6 mb-6">
                {/* Main image */}
                <div className="flex-shrink-0">
                  <ProductImage product={viewingProduct} size="lg" />
                  {/* Thumbnail row */}
                  {viewingProduct.images && viewingProduct.images.length > 1 && (
                    <div className="flex gap-2 mt-2">
                      {viewingProduct.images.slice(0, 4).map((img, i) => (
                        <img key={i} src={img} alt={`${viewingProduct.name} ${i + 1}`}
                          className="w-10 h-10 rounded-md object-cover border border-[var(--color-dashboard-border)] cursor-pointer hover:border-[var(--color-brand-500)] transition-colors" />
                      ))}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant={viewingProduct.isActive ? "success" : "default"}>
                      {viewingProduct.isActive ? "ACTIVO" : "INACTIVO"}
                    </Badge>
                    {viewingProduct.isOffer && <Badge variant="warning">EN OFERTA</Badge>}
                    {viewingProduct.stock === 0 && <Badge variant="error">AGOTADO</Badge>}
                    {viewingProduct.stock > 0 && viewingProduct.stock <= viewingProduct.minStock && <Badge variant="warning">BAJO STOCK</Badge>}
                  </div>

                  <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">{viewingProduct.name}</h3>

                  {viewingProduct.description && (
                    <p className="text-sm text-[var(--color-text-secondary)] mb-4">{viewingProduct.description}</p>
                  )}

                  {/* Prices */}
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-2xl font-bold text-[var(--color-brand-500)]">
                      {formatCurrency(viewingProduct.isOffer && viewingProduct.offerPrice ? viewingProduct.offerPrice : viewingProduct.price, config)}
                    </span>
                    {viewingProduct.isOffer && viewingProduct.offerPrice && (
                      <span className="text-sm text-[var(--color-text-muted)] line-through">
                        {formatCurrency(viewingProduct.price, config)}
                      </span>
                    )}
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)]">
                      <Box size={14} className="text-[var(--color-status-info)]" />
                      <div>
                        <p className="text-[10px] text-[var(--color-text-muted)]">Stock</p>
                        <p className={`text-sm font-bold ${viewingProduct.stock <= viewingProduct.minStock ? "text-[var(--color-status-warning)]" : "text-[var(--color-text-primary)]"}`}>
                          {viewingProduct.stock} uds
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-dashboard-bg)] border border-[var(--color-dashboard-border)]">
                      <DollarSign size={14} className="text-[var(--color-status-success)]" />
                      <div>
                        <p className="text-[10px] text-[var(--color-text-muted)]">Ganancia</p>
                        <p className="text-sm font-bold text-[var(--color-status-success)]">
                          {formatCurrency(viewingProduct.price - viewingProduct.cost, config)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail grid */}
              <div className="border-t border-[var(--color-dashboard-border)] pt-4">
                <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Información Completa</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                  <DetailRow icon={<Tag size={13} />} label="Categoría" value={getCategoryName(viewingProduct.categoryId)} />
                  <DetailRow icon={<Package size={13} />} label="Marca" value={viewingProduct.brand || "—"} />
                  <DetailRow icon={<Palette size={13} />} label="Color" value={viewingProduct.color || "—"} />
                  <DetailRow icon={<Box size={13} />} label="Stock mínimo" value={`${viewingProduct.minStock} uds`} />
                  <DetailRow icon={<DollarSign size={13} />} label="Precio compra" value={formatCurrency(viewingProduct.cost, config)} />
                  <DetailRow icon={<DollarSign size={13} />} label="Precio venta" value={formatCurrency(viewingProduct.price, config)} />
                  {viewingProduct.isOffer && viewingProduct.offerPrice && (
                    <DetailRow icon={<DollarSign size={13} />} label="Precio oferta" value={formatCurrency(viewingProduct.offerPrice, config)} />
                  )}
                  <DetailRow icon={<Info size={13} />} label="ID" value={viewingProduct.id.slice(0, 12) + "..."} />
                </div>
              </div>

              {/* Tags */}
              {viewingProduct.tags && viewingProduct.tags.length > 0 && (
                <div className="border-t border-[var(--color-dashboard-border)] pt-4 mt-4">
                  <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Etiquetas</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingProduct.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-[var(--color-brand-500)]/10 text-[var(--color-brand-500)] border border-[var(--color-brand-500)]/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <FullScreenLoader state={loaderState} message={loaderMessage} detail={loaderDetail} onClose={handleLoaderClose} />
    </div>
  );
}

// Sub-component for detail rows
function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[var(--color-text-muted)]">{icon}</span>
      <span className="text-xs text-[var(--color-text-muted)] w-28">{label}</span>
      <span className="text-sm text-[var(--color-text-primary)] font-medium">{value}</span>
    </div>
  );
}
