# Changelog

## v2.8.0 — Mobile PDF Fix, Logout, Search UX, Security Policy, Wiki

### Mobile PDF Viewer Fix
- **Fixed "Este contenido está bloqueado" error** on mobile — The CSP header was missing `frame-src 'self' blob:` which blocked PDF iframes on mobile browsers.
- **Mobile fallback:** On screens smaller than `sm:` breakpoint, the PDF viewer now shows a download button instead of an iframe, since most mobile browsers cannot render PDFs inline.
- **Print button** hidden on mobile (not supported).

### Mobile Sidebar Logout
- **Added "Cerrar sesión" button** to the sidebar footer, visible only on mobile (`lg:hidden`).
- **Added "Configuración" link** to sidebar footer for quick access on mobile.

### Search UX Improvements
- **Added visible X close button** next to the search input to close the search modal. Previously only Esc key and overlay click worked.
- **Fixed mobile overflow** — Search modal now uses `mx-4` margin on mobile instead of full width, preventing edge clipping.
- **Positioned at 10% from top on mobile** (vs 15% on desktop) for better thumb reach.

### Export Dropdown Fix
- **Fixed mobile overflow** on all 6 export menus (Ventas, Compras, Inventario, Productos, Pedidos, Reportes) — uses `min-w-[180px] max-w-[calc(100vw-3rem)]` to prevent clipping.

### Security Policy
- Added `SECURITY.md` — Instructions for responsible vulnerability disclosure, supported versions, security measures overview, response times.

### Wiki (separate from zip)
- 6 Wiki pages for GitHub: Home, Inicio rápido, Arquitectura, Módulos, Facturación electrónica, Seguridad, FAQ.

---

## v2.7.0 — Mobile UX, Dark Mode Fix, Theme Animation, Authorship

### Mobile Responsiveness
- **Global search** — Shows only magnifying glass icon on mobile, full search bar on desktop (`sm:` breakpoint).
- **Export dropdown** — Fixed overflow on mobile with `max-w-[calc(100vw-2rem)]` so menu is fully visible.
- **Admin menu** — Avatar button works on mobile (click to open), text label visible on `sm:` screens.

### Dark Mode Fix
- **Improved text visibility** — Dark mode `--color-text-muted` changed from `#64748B` to `#94A3B8` (brighter).
- **Dark mode `--color-text-secondary`** changed from `#94A3B8` to `#CBD5E1` for better subtitle readability.
- **Light mode `--color-text-muted`** adjusted to `#64748B` for proper contrast on white backgrounds.

### Theme Animation
- **Smooth theme transition** — Added `transition: background-color 0.3s ease, color 0.3s ease` to body.
- **Toggle button animation** — Active theme icon scales up with shadow (`scale-110 shadow-md`).

### Input Visibility
- **Search input placeholders** — Changed opacity from `/40` (40%) to `/70` (70%) for better visibility in both themes.

### Loading States
- **Removed FullScreenLoader** from Clientes and Facturación initial page loads — replaced with simple inline spinner for faster perceived performance.

### Authorship & Metadata
- **Removed all AI references** — PDF footer now reads "Desarrollado por Daniel Fernando Castillo Mera".
- **Author metadata confirmed** — `<meta>` tags show Daniel Fernando Castillo Mera as author, creator, and copyright holder.

---

## v2.6.0 — Ecuador-Only, XLSX Export, Formas de Pago, UI Fixes

### Formas de Pago (Tabla 24 SRI)
- **EFECTIVO** (código 01) — Previously showed "SIN UTILIZACIÓN DEL SISTEMA FINANCIERO", now shows "EFECTIVO".
- **TRANSFERENCIA / DEPÓSITO BANCARIO** (código 20) — Previously "OTROS CON UTILIZACIÓN DEL SISTEMA FINANCIERO".
- All 8 formas de pago from SRI Tabla 24 are available with user-friendly labels.

### Excel Export (.xlsx)
- Added **Excel (.xlsx) export** button to ALL modules: Ventas, Compras, Inventario, Productos, Pedidos, Reportes.
- Uses SheetJS library for professional Excel file generation with auto-width columns.
- Export dropdown now shows 3 options: CSV, PDF, Excel (.xlsx).

### Ecuador-Only Configuration
- **Regional settings locked to Ecuador** — Language (Español), Timezone (America/Guayaquil UTC-5), Currency (USD), Date Format (DD/MM/AAAA) are now read-only with informational note.
- Removed international timezone, currency, and language selectors.

### UI Fixes
- **Config card descriptions no longer truncated** — Removed `truncate` CSS class so full description text shows on configuration section cards.

### Dependencies
- Added: `xlsx` (SheetJS) for Excel export.

---

## v2.5.0 — Input Validation, Currency Fix, Security, Cross-Browser, License

### Real-Time Input Validation
- **Configuración > RUC**: Digits-only, max 13 characters, `inputMode="numeric"` for mobile keyboards.
- **Configuración > Teléfono**: Digits-only, max 15 characters.
- **Configuración > Establecimiento/Punto Emisión**: Digits-only, max 3 characters.
- All numeric fields across the dashboard use `type="number"` with appropriate `min`, `max`, `step` constraints.
- Clientes page already has Ecuador-specific validation (cédula 10 digits, RUC 13, celular 09XX 10 digits, fijo 02-07 9 digits).

### Currency Fix — Charts & Reports
- **Fixed Q (Quetzales) → $ (USD)** in sales trend chart Y-axis (`$${v}` instead of `Q${v}`).
- **Fixed Q → $** in category chart tooltip.
- All currency values across Panel de Control and Reportes now use `formatCurrency()` which outputs `$X.XX` for Ecuador (USD).

### Security Hardening
- **HTTP Security Headers** (next.config.ts): X-Frame-Options SAMEORIGIN, X-Content-Type-Options nosniff, X-XSS-Protection, Strict-Transport-Security, Content-Security-Policy, Referrer-Policy, Permissions-Policy.
- **`poweredByHeader: false`** — Removes X-Powered-By header to prevent technology fingerprinting.
- **Enhanced proxy.ts** — Better route protection with explicit public routes (store, health, auth).
- **Supabase RLS** — All tables have Row Level Security enabled with tenant-scoped policies.
- **Server-side auth** — All API routes verify user session via `getCurrentTenantId()`.

### Cross-Browser Compatibility
- **X-UA-Compatible IE=edge** meta tag for legacy browser rendering.
- **`viewport`** with device-width and initial-scale already set.
- Built on Next.js 16 + Tailwind CSS 4 which support all modern browsers (Chrome 80+, Firefox 78+, Safari 14+, Edge 80+).
- Responsive design with mobile-first approach: cards on mobile, tables on desktop.

### License & Copyright
- **LICENSE** file: Proprietary software license — all rights reserved to Daniel Fernando Castillo Mera.
- **Copyright metadata** in `<head>`: author, creator, copyright notice.
- **`robots: { index: false, follow: false }`** — prevents search engines from indexing the dashboard.

### Files Added/Modified
- New: `LICENSE`
- Modified: `next.config.ts` (security headers)
- Modified: `src/proxy.ts` (enhanced route protection)
- Modified: `src/app/layout.tsx` (copyright metadata)
- Modified: `src/components/charts/sales-trend-chart.tsx` ($ instead of Q)
- Modified: `src/components/charts/category-chart.tsx` ($ instead of Q)
- Modified: `src/app/(dashboard)/configuracion/page.tsx` (input validation)

---

## v2.4.0 — Professional PDF RIDE, PDF Viewer, XML Viewer

### Professional PDF Generation (RIDE Format)
- **Real PDF invoices** using `@react-pdf/renderer` — generates proper A4 PDF documents with professional RIDE layout (Representación Impresa del Documento Electrónico).
- PDF includes: company header with RUC, invoice box with number and clave de acceso, customer data, items table with columns (code, description, qty, price, discount, total), tax breakdown (15%, 0%, no objeto, exento), grand total bar, payment method, and additional info section.
- Served via `/api/invoices/[id]?format=pdf` with `Content-Type: application/pdf`.

### Invoice Viewer & Actions
- **Eye icon (Ver PDF)** — Opens PDF in a full-screen modal viewer with embedded iframe. Viewer includes "Descargar" (green) and "Imprimir" (blue) buttons in the toolbar.
- **Download icon (Descargar PDF)** — Direct PDF download.
- **FileText icon (Ver XML)** — Opens XML in a syntax-highlighted modal viewer with download button. Uses blue document icon as requested.
- No more .txt files — everything is proper PDF.
- Mobile invoice cards also have all 3 action buttons.

### Removed
- Lock icon removed from invoice actions.
- "Anuladas" stat removed (Ecuador: invoices cannot be voided).

### Dependencies
- Added: `@react-pdf/renderer` for server-side PDF generation.

---

## v2.3.1 — Ecuador Compliance: No Anulación, Working Downloads

### Ecuador Fiscal Compliance
- **Removed "Anuladas" stat card and ANULADA status** — In Ecuador, emitted invoices cannot be voided per SRI regulations. The stats panel now shows: Total Facturas, Emitidas, Ingresos Totales (3 cards instead of 4).
- **Removed Lock icon** from invoice actions — was confusing and unnecessary.
- **Invoice immutability enforced** — emitted invoices have no edit capabilities in the UI.

### Working Action Buttons
- **Download button** now downloads the invoice as a text file via `/api/invoices/[id]?format=pdf`.
- **XML button** now downloads the SRI XML file via `/api/invoices/[id]?format=xml` with proper `Content-Disposition` headers.
- Both buttons show a toast notification confirming the download.
- New API route: `src/app/api/invoices/[id]/route.ts` — serves invoice detail, XML download, and receipt download.

### Mobile
- Invoice cards on mobile now have download/XML buttons visible.

---

## v2.3.0 — Config Fix, Unsaved Guard, Loader 100%

### Critical Fix
- **Fixed "Unknown argument language" error** in business profile save — API route now strips `language`, `timezone`, `currency`, `dateFormat` before sending to Prisma (these are UI-only fields stored locally, not in the BusinessProfile model).
- **Business profile create/edit works** — upsert only passes valid Prisma fields.

### Unsaved Changes Guard
- New `UnsavedGuardProvider` component wraps the entire dashboard layout.
- When a form is open (Clientes, Facturación), sidebar navigation is **intercepted** — shows a centered confirmation dialog: "¿Desea salir sin guardar?" with green "Continuar editando" and red "Salir sin guardar" buttons.
- Also blocks browser tab close/refresh with `beforeunload` event.
- Applied to: Clientes form, Facturación invoice creation form.

### FullScreenLoader
- **Always reaches 100%** — Complete rewrite with simple state machine (`circle` → `result`). Uses `setInterval` for smooth animation instead of static timeout steps.
- Shows 100% for 500ms before transitioning to success/error icon.
- Faster initial animation (reaches 50% in ~600ms).

### Placeholder Cleanup
- All form placeholders now use **generic example data** — no real RUC numbers, phone numbers, or company data anywhere in the dashboard.

### Prisma Schema
- `Customer.direccion`, `celular`, `email` are now optional (`String?`) to prevent crashes with existing database rows.

---

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
