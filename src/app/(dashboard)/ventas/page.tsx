"use client";

import { useState, useMemo, useEffect } from "react";
import { Download, FileText, FileSpreadsheet, Plus, Calendar } from "lucide-react";
import { PageHeader, Card, Button, ErrorState } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/data-table";
import { FilterBar } from "@/components/ui/filter-bar";
import { ProductSelector } from "@/components/ui/product-selector";
import { FullScreenLoader } from "@/components/ui/fullscreen-loader";
import { useOperationGuard } from "@/components/ui/operation-guard";
import { getActiveTenantConfig, formatCurrency } from "@/lib/tenant-config";
import { useExport } from "@/lib/use-export";
import { useData } from "@/lib/hooks/use-data";
import { createSaleAction } from "@/lib/actions/data";

interface Sale {
  id: string; productId: string; productName: string;
  quantity: number; unitPrice: number; total: number;
  date: string | Date; userId: string; tenantId: string;
}

interface Product {
  id: string; name: string; price: number; cost: number;
  stock: number; minStock: number; brand?: string;
  images?: string[]; isActive: boolean;
}

export default function VentasPage() {
  const config = getActiveTenantConfig();
  const { handleExportCSV: exportCSV, handleExportPDF: exportPDF } = useExport();
  const { startCriticalOperation, endCriticalOperation } = useOperationGuard();
  const [filter, setFilter] = useState("Todas");
  const [showForm, setShowForm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Form state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  // Loader state
  const [loaderState, setLoaderState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [loaderMessage, setLoaderMessage] = useState("");
  const [loaderDetail, setLoaderDetail] = useState("");

  const params: Record<string, string> = {};
  if (dateFrom) params.from = dateFrom;
  if (dateTo) params.to = dateTo;

  const { data, isLoading, error, mutate } = useData<{ sales: Sale[] }>("/api/sales", Object.keys(params).length > 0 ? params : undefined);
  const { data: productsData } = useData<{ products: Product[] }>("/api/products");
  const products = productsData?.products || [];

  // Auto-fill price when product selected
  useEffect(() => {
    if (selectedProduct) {
      setUnitPrice(String(selectedProduct.price));
    }
  }, [selectedProduct]);

  // Operation guard: activate when form is open with data
  useEffect(() => {
    const hasData = selectedProduct || quantity || unitPrice;
    if (showForm && hasData) {
      startCriticalOperation({
        operationName: "Registrar Venta",
        returnPath: "/ventas",
        onCancel: () => {
          resetForm();
          setShowForm(false);
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm, selectedProduct, quantity]);

  function resetForm() {
    setSelectedProduct(null);
    setQuantity("");
    setUnitPrice("");
    endCriticalOperation();
  }

  function openForm() {
    resetForm();
    setShowForm(true);
  }

  function closeForm() {
    resetForm();
    setShowForm(false);
  }

  const sales = useMemo(() => {
    if (!data?.sales) return [];
    const items = data.sales.map(s => ({ ...s, date: new Date(s.date) }));
    if (filter === "Hoy") return items.filter(s => s.date.toDateString() === new Date().toDateString());
    if (filter === "Esta Semana") {
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      return items.filter(s => s.date >= weekAgo);
    }
    if (filter === "Más vendidos") return [...items].sort((a, b) => b.quantity - a.quantity);
    return items;
  }, [data, filter]);

  const totalUnits = sales.reduce((s, v) => s + v.quantity, 0);
  const totalRevenue = sales.reduce((s, v) => s + v.total, 0);

  const exportColumns = [
    { key: "productName", header: "Producto" }, { key: "quantity", header: "Cantidad" },
    { key: "unitPrice", header: "Precio Unitario" }, { key: "total", header: "Total" },
    { key: "date", header: "Fecha" },
  ];
  function handleExportCSV() {
    exportCSV(sales as unknown as Record<string, unknown>[], exportColumns, `ventas_${new Date().toISOString().split("T")[0]}`);
    setShowExportMenu(false);
  }
  async function handleExportPDF() {
    await exportPDF(sales as unknown as Record<string, unknown>[], exportColumns, `Reporte de Ventas — ${config.name}`, `ventas_${new Date().toISOString().split("T")[0]}`);
    setShowExportMenu(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!quantity || Number(quantity) <= 0) return;
    if (!unitPrice || Number(unitPrice) <= 0) return;

    if (Number(quantity) > selectedProduct.stock) {
      setLoaderState("error");
      setLoaderMessage("Stock Insuficiente");
      setLoaderDetail(`${selectedProduct.name} solo tiene ${selectedProduct.stock} unidades disponibles.`);
      return;
    }

    setLoaderState("loading");
    setLoaderMessage("Registrando Venta...");
    setLoaderDetail(`${selectedProduct.name} × ${quantity} uds`);

    const result = await createSaleAction({
      productId: selectedProduct.id,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
    });

    if (result.success) {
      setLoaderState("success");
      setLoaderMessage("¡Venta Registrada!");
      setLoaderDetail(`${selectedProduct.name} × ${quantity} uds — ${formatCurrency(Number(quantity) * Number(unitPrice), config)}`);
    } else {
      setLoaderState("error");
      setLoaderMessage("Error al Registrar");
      setLoaderDetail(result.message);
    }
  }

  function handleLoaderClose() {
    if (loaderState === "success") {
      resetForm();
      setShowForm(false);
      mutate();
    }
    setLoaderState("idle");
    setLoaderMessage("");
    setLoaderDetail("");
  }

  const columns: Column<Sale & { date: Date }>[] = [
    { key: "productName", header: "Producto", sortValue: (v) => v.productName, render: (v) => <span className="font-medium text-[var(--color-text-primary)]">{v.productName}</span> },
    { key: "quantity", header: "Cantidad", sortValue: (v) => v.quantity, render: (v) => <span className="font-semibold">{v.quantity}</span> },
    { key: "unitPrice", header: "P/U", render: (v) => formatCurrency(v.unitPrice, config) },
    { key: "total", header: "Total", render: (v) => <span className="font-bold text-[var(--color-brand-500)]">{formatCurrency(v.total, config)}</span> },
    { key: "date", header: "Fecha", sortValue: (v) => v.date, render: (v) => v.date.toLocaleDateString("es-EC") },
  ];

  if (error) return <ErrorState message={error} onRetry={mutate} />;

  return (
    <div>
      <PageHeader title="Módulo de Ventas" description={`${sales.length} transacciones · ${formatCurrency(totalRevenue, config)} en ingresos`}
        actions={
          <div className="flex gap-2">
            <div className="relative">
              <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={() => setShowExportMenu(!showExportMenu)}>Exportar</Button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] shadow-lg py-1 z-50">
                  <button onClick={handleExportCSV} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)] transition-colors">
                    <FileSpreadsheet size={14} className="text-green-500" /> CSV</button>
                  <button onClick={handleExportPDF} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)] transition-colors">
                    <FileText size={14} className="text-red-500" /> PDF</button>
                </div>
              )}
            </div>
            <Button size="sm" icon={<Plus size={14} />} onClick={showForm ? closeForm : openForm}>
              {showForm ? "Cancelar" : "Nueva Venta"}
            </Button>
          </div>
        } />

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <FilterBar filters={["Todas", "Hoy", "Esta Semana", "Más vendidos"]} active={filter} onFilter={setFilter} label="Filtros de ventas" />
        <div className="flex items-center gap-2 ml-auto">
          <Calendar size={14} className="text-[var(--color-text-muted)]" />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-2 py-1 text-xs rounded-lg border border-[var(--color-dashboard-border)] bg-[var(--color-dashboard-surface)] text-[var(--color-text-primary)]" />
          <span className="text-xs text-[var(--color-text-muted)]">—</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-2 py-1 text-xs rounded-lg border border-[var(--color-dashboard-border)] bg-[var(--color-dashboard-surface)] text-[var(--color-text-primary)]" />
          {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-[10px] text-[var(--color-brand-500)] hover:underline">Limpiar</button>}
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Registrar Nueva Venta</h3>
            <button onClick={closeForm} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">Cancelar</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
              <div className="sm:col-span-2">
                <ProductSelector products={products} selected={selectedProduct} onSelect={setSelectedProduct} label="Producto" priceField="price" placeholder="Buscar producto por nombre o marca..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Cantidad *</label>
                <input type="number" min="1" max={selectedProduct?.stock || 9999} value={quantity} onChange={e => setQuantity(e.target.value)} required placeholder="0"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-dashboard-border)] bg-[var(--color-dashboard-surface)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-500)]" />
                {selectedProduct && <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Disponible: {selectedProduct.stock} uds</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Precio Unitario</label>
                <input type="number" min="0" step="0.01" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-dashboard-border)] bg-[var(--color-dashboard-surface)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-500)]" />
              </div>
            </div>

            {selectedProduct && quantity && Number(quantity) > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-[var(--color-brand-500)]/5 border border-[var(--color-brand-500)]/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-secondary)]">{selectedProduct.name} × {quantity} uds</span>
                  <span className="text-lg font-bold text-[var(--color-brand-500)]">{formatCurrency(Number(quantity) * Number(unitPrice || 0), config)}</span>
                </div>
                {Number(quantity) > selectedProduct.stock && (
                  <p className="text-xs text-red-500 mt-1 font-medium">⚠ La cantidad excede el stock disponible ({selectedProduct.stock} uds)</p>
                )}
              </div>
            )}

            <div className="flex gap-2 justify-end mt-4">
              <Button variant="secondary" size="sm" type="button" onClick={closeForm}>Cancelar</Button>
              <Button size="sm" type="submit" disabled={!selectedProduct || !quantity || Number(quantity) <= 0}>Registrar Venta</Button>
            </div>
          </form>
        </Card>
      )}

      <Card padding={false}>
        <DataTable columns={columns} data={sales} isLoading={isLoading} emptyMessage="No hay ventas registradas" caption="Historial de ventas" />
        {sales.length > 0 && (
          <div className="flex justify-between items-center px-5 py-3 bg-[var(--color-brand-500)] text-white rounded-b-2xl">
            <span className="text-sm font-bold">TOTAL VENTAS</span>
            <span className="text-sm font-bold">{totalUnits} uds. · {formatCurrency(totalRevenue, config)}</span>
          </div>
        )}
      </Card>

      <FullScreenLoader state={loaderState} message={loaderMessage} detail={loaderDetail} onClose={handleLoaderClose} />
    </div>
  );
}
