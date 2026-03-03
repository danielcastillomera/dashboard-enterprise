# Changelog

## v2.1.0 — Phase 13: Billing Module (SRI Ecuador)

### New Features
- **Facturación Electrónica SRI Ecuador** — Complete billing module with invoice creation, XML generation (v2.1.0), and clave de acceso (49-digit Módulo 11)
- **Gestión de Clientes** — Full CRUD with DataTable, search, tipo de identificación (RUC/Cédula/Pasaporte/Consumidor Final)
- **Configuración de Empresa** — Business settings panel with RUC, razón social, direcciones, logo URL, ambiente SRI, punto de emisión
- **Panel de Facturación** — Stats dashboard (total, emitidas, anuladas, ingresos), invoice creation form with real-time tax calculation
- **Vista Previa de Factura** — Preview invoice before generating (RIDE-style layout)
- **Códigos de Producto** — Product code field for invoices (codigoPrincipal)
- **SRI Tax Compliance** — Full IVA 15%/0%/No Objeto/Exento breakdown, ICE, IRBPNR, propina support
- **XML SRI v2.1.0** — Automatic XML generation with infoTributaria, infoFactura, detalles, infoAdicional
- **Gapless Sequential Numbering** — Atomic counter increment in transaction (no gaps on rollback)
- **Quick Product Add** — Click-to-add product buttons in invoice form
- **SWR Data Fetching** — Real-time data sync with SWR across billing pages

### Database Changes
- Added `customers` table with tenant isolation + RLS
- Rebuilt `business_profiles` with SRI fields (RUC, ambiente, obligado contabilidad, etc.)
- Rebuilt `invoices` table with full SRI RIDE fields (clave acceso, authorization, tax breakdown)
- Rebuilt `invoice_items` with SRI fields (codigo principal/auxiliar, IVA codes)
- Added `code` column to `products` table
- Migration SQL: `supabase/billing-migration.sql`

### Sidebar
- Added "Clientes" module with Users icon

---

## v2.0.1 — Health Check + UUID Fix

- Health check endpoint (`/api/health`)
- UUID serverless fix (removed `crypto.randomUUID()`, use DB defaults)
- Professional `.gitignore`
- Sortable DataTable with row counter

## v2.0.0 — Enterprise Features

- ProductSelector, FullScreenLoader, OperationGuard
- Realtime Notifications via Supabase
- Global Search (Ctrl+K)
- RLS policies
- Toast system

## v1.0.0 — Initial Release

- 5 CRUD modules (Ventas, Compras, Inventario, Pedidos, Productos)
- Multi-tenant architecture with Supabase Auth
- Dark theme dashboard with CSS custom properties
- Configurable sidebar navigation
