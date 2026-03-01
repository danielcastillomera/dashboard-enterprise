"use client";

import { useState, useMemo } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { PageHeader, Card, Badge, Button, ErrorState } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/data-table";
import { FilterBar } from "@/components/ui/filter-bar";
import { getActiveTenantConfig, formatCurrency } from "@/lib/tenant-config";
import { useExport } from "@/lib/use-export";
import { useData } from "@/lib/hooks/use-data";

interface Product {
  id: string; name: string; price: number; cost: number;
  stock: number; minStock: number; isActive: boolean;
  isOffer: boolean; brand?: string;
}

export default function InventarioPage() {
  const config = getActiveTenantConfig();
  const { handleExportCSV: exportCSV, handleExportPDF: exportPDF } = useExport();
  const [filter, setFilter] = useState("Todos");
  const [showExportMenu, setShowExportMenu] = useState(false);

  const { data, isLoading, error, mutate } = useData<{ products: Product[] }>("/api/products");

  const getStatus = (p: Product) => { if (p.stock === 0) return "agotado"; if (p.stock <= p.minStock) return "bajo"; return "ok"; };

  const products = useMemo(() => {
    if (!data?.products) return [];
    if (filter === "OK") return data.products.filter(p => getStatus(p) === "ok");
    if (filter === "Bajo Stock") return data.products.filter(p => getStatus(p) === "bajo");
    if (filter === "Agotados") return data.products.filter(p => getStatus(p) === "agotado");
    return data.products;
  }, [data, filter]);

  const totalStock = (data?.products || []).reduce((s, p) => s + p.stock, 0);
  const lowCount = (data?.products || []).filter(p => getStatus(p) === "bajo").length;
  const outCount = (data?.products || []).filter(p => getStatus(p) === "agotado").length;

  const invExportCols = [{ key: "nombre", header: "Producto" }, { key: "stock", header: "Stock" }, { key: "minStock", header: "Stock Mín." }, { key: "estado", header: "Estado" }];
  const invExportData = () => products.map(p => ({ nombre: p.name, stock: p.stock, minStock: p.minStock, estado: getStatus(p) })) as unknown as Record<string, unknown>[];

  function handleExportCSV() { exportCSV(invExportData(), invExportCols, `inventario_${new Date().toISOString().split("T")[0]}`); setShowExportMenu(false); }
  async function handleExportPDF() { await exportPDF(invExportData(), invExportCols, `Inventario — ${config.name}`, `inventario_${new Date().toISOString().split("T")[0]}`); setShowExportMenu(false); }

  const statusBadge = (p: Product) => {
    const s = getStatus(p);
    return s === "agotado" ? <Badge variant="error">AGOTADO</Badge> : s === "bajo" ? <Badge variant="warning">BAJO</Badge> : <Badge variant="success">OK</Badge>;
  };

  const columns: Column<Product>[] = [
    { key: "name", header: "Producto", render: (v) => <span className="font-medium text-[var(--color-text-primary)]">{v.name}</span> },
    { key: "stock", header: "Stock Actual", render: (v) => <span className={`font-bold ${v.stock <= v.minStock ? "text-[var(--color-status-error)]" : "text-[var(--color-text-primary)]"}`}>{v.stock}</span> },
    { key: "minStock", header: "Stock Mín.", render: (v) => String(v.minStock) },
    { key: "price", header: "Precio", render: (v) => formatCurrency(v.price, config) },
    { key: "status", header: "Estado", render: (v) => statusBadge(v) },
  ];

  if (error) return <ErrorState message={error} onRetry={mutate} />;

  return (
    <div>
      <PageHeader title="Inventario" description="Control de stock en tiempo real"
        actions={
          <div className="relative">
            <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={() => setShowExportMenu(!showExportMenu)}>Exportar</Button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-[var(--color-dashboard-surface)] border border-[var(--color-dashboard-border)] shadow-lg py-1 z-50">
                <button onClick={handleExportCSV} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)] transition-colors"><FileSpreadsheet size={14} className="text-green-500" /> CSV</button>
                <button onClick={handleExportPDF} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-dashboard-surface-hover)] transition-colors"><FileText size={14} className="text-red-500" /> PDF</button>
              </div>
            )}
          </div>
        } />

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <FilterBar filters={["Todos", "OK", "Bajo Stock", "Agotados"]} active={filter} onFilter={setFilter} label="Filtros de inventario" />
        <div className="flex gap-3 ml-auto text-xs text-[var(--color-text-muted)]">
          <span>Total: <strong className="text-[var(--color-text-primary)]">{totalStock} uds</strong></span>
          <span>Bajo stock: <strong className="text-amber-500">{lowCount}</strong></span>
          <span>Agotados: <strong className="text-red-500">{outCount}</strong></span>
        </div>
      </div>

      <Card padding={false}>
        <DataTable columns={columns} data={products} isLoading={isLoading} emptyMessage="No hay productos en inventario" caption="Estado del inventario" />
      </Card>
    </div>
  );
}
