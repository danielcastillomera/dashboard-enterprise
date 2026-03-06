# Changelog

## v2.2.1 — Fix HTTP 500 Clientes + Loader Progress

### Critical Fix
- **Fixed HTTP 500 on Clientes page** — The `import { sendInvoiceEmail }` at the top of `queries.ts` (line 6) was a **static import**. When the module loaded for ANY query (including `getCustomers`), it imported the entire Resend email chain. If any part of that chain had an issue (missing env vars, module init error), the ENTIRE billing module failed — including the simple customer list. Changed to **dynamic import** (`await import(...)`) so it only loads when actually sending an invoice.
- **Made Customer fields nullable in Prisma** — `direccion`, `celular`, `email` are now optional (`String?`) to match existing database rows that may not have these columns populated.

### FullScreenLoader Improvements
- **Always reaches 100%** — Previously, fast operations jumped from ~10% directly to success without ever showing 100%. Now the loader transitions: loading → 100% (visible for 400ms) → success/error icon.
- **Faster initial progress** — Steps start at 150ms instead of 600ms, so the animation feels responsive even for fast operations.
- **Smooth state transitions** — Uses `displayState` to ensure the 100% circle is visible before switching to the checkmark/error icon.

---

## v2.2.0 — Stability, Email Integration & Standards

### Critical Fixes
- **Fixed HTTP 500 on Clientes page** — Root cause: `sendInvoiceEmail` import at module level caused entire billing queries module to fail if Resend wasn't configured. Changed to dynamic import.
- **Single definitive migration SQL** — `supabase/migration-v2.2.0-complete.sql` replaces all previous migration files. Includes `celular` column, uses `IF NOT EXISTS`.

### Email Integration (Resend)
- Resend client with graceful fallback when API key not set
- Invoice auto-send on emission (non-blocking)
- Professional HTML email template
- `EMAIL_FROM` configurable via environment variable

### Invoice Immutability
- Emitted invoices (`EMITIDA`) cannot be edited — Ecuador fiscal regulations

### Code Quality
- All billing pages use project's `useData` hook (consistent with working pages)
- Safe data extraction prevents runtime crashes
- Dynamic imports for email module prevent module-level failures

### Documentation
- Professional `README.md` with installation, structure, env vars
- Resend setup guide in README
- `CHANGELOG.md` following Keep a Changelog standard

---

## v2.1.4 — README

### Documentation
- **README.md** — Documentación principal del repositorio: descripción del proyecto, características, tech stack, instalación paso a paso, scripts, estructura del proyecto, despliegue en Vercel y enlaces a documentación adicional.

---

## v2.1.3 — Resend Setup Documentation

### Documentation
- **Resend configuration guide** — Added `docs/RESEND_SETUP.md` with step-by-step instructions:
  - How to obtain API Key from Resend (logged in via GitHub)
  - Domain verification with DNS records (SPF, DKIM)
  - Local `.env.local` configuration
  - Vercel environment variables setup
  - Supabase considerations (no changes needed)
  - Testing and troubleshooting

---

## v2.1.2 — Critical Fix: Clientes + Facturación Pages

### Root Cause Fix
- **Replaced SWR with project's `useData` hook** — Both Clientes and Facturación pages were using the `useSWR` library while ALL other working pages (Ventas, Compras, Pedidos) use the project's built-in `useData` hook. This incompatibility caused client-side crashes in Vercel production.
- **Facturación page was missing entirely** — The file was deleted in a previous session but never recreated, causing a runtime crash when navigating to `/facturacion`.

### Architecture Alignment
- Both pages now use identical patterns to working pages: `useData`, `PageHeader`, `Card`, `StatCard`, `ErrorState`, `FullScreenLoader`, `formatCurrency`
- Safe data extraction: `Array.isArray(rawData) ? rawData : []` prevents crashes when API returns errors
- Products API response handled correctly: extracts `data.products` array from `{ products, categories }` wrapper

### Features Preserved
- Ecuador phone validation (celular 10 dígitos 09XX, fijo 9 dígitos 0X)
- All fields required (tipo ID, identificación, razón social, dirección, celular, email)
- No browser autocomplete on client forms
- Mobile-responsive: cards on mobile, tables on desktop
- Invoice creation with real-time IVA calculation
- Quick product add buttons
- Invoice preview modal

---

## v2.1.1 — Hotfix: Clientes + Facturación + UX

### Bug Fixes
- **Fixed client-side crash** on "Nueva Factura" — products API returns `{products, categories}` but code expected array
- **Disabled browser autocomplete** on all client forms — prevents personal data leakage via autofill
- **Fixed sidebar order** — Panel, Clientes, Compras, Ventas, Pedidos, Productos, Inventario, Facturación, Reportes, Configuración

### New Features
- **Campo Celular Ecuador** — Separate field for mobile numbers (10 dígitos, inicia con 09)
- **Teléfono Fijo Ecuador** — Validated field (9 dígitos, código de área 02/03/04/05/06/07)
- **Real-time phone formatting** — Displays formatted as user types (0991 234 567)
- **Ecuador ID validation** — Cédula (10 digits), RUC (13 digits), Pasaporte (5+ chars)
- **All fields required** in client form — Tipo ID, Identificación, Razón Social, Dirección, Celular, Email
- **Responsive mobile cards** — Client list shows cards on mobile, table on desktop
- **Form validation with error messages** — Per-field error indicators and descriptions

### Database Changes
- Added `celular` column (VARCHAR 15) to customers table
- Migration: `supabase/patch-v2.1.1-celular.sql`

---

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
