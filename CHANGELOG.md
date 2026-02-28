# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [1.0.0] — 2026-02-20

### Agregado
- **Autenticación enterprise** — Login invite-only, sin registro público (patrón Stripe/Shopify)
- **Dashboard Panel** — KPIs, gráficos Recharts, resumen financiero, alertas de inventario
- **Módulo de Ventas** — CRUD, filtros predefinidos, filtro por rango de fechas, exportación PDF/CSV
- **Módulo de Compras** — CRUD, filtros, rango de fechas, exportación PDF/CSV
- **Módulo de Inventario** — Control de stock, alertas bajo stock/agotado, exportación PDF/CSV
- **Módulo de Pedidos** — Gestión de estados, búsqueda, filtro por fecha, modal de detalle, exportación
- **Módulo de Productos** — Catálogo con categorías, imágenes, ofertas, activación/desactivación
- **Módulo de Reportes** — Vistas General/Ventas/Compras/Rentabilidad con gráficos, exportación
- **Configuración** — Página de settings: negocio, idioma, moneda, timezone, apariencia, seguridad
- **Dark/Light mode** — Cambio automático con preferencia del sistema
- **Exportación funcional** — PDF (jsPDF + autotable) y CSV (UTF-8 BOM) en todos los módulos
- **WCAG 2.1/2.2** — Skip-to-content, focus-visible, aria landmarks, reduced motion, target size 44px
- **Multi-país** — Plantillas configurables para Ecuador, México, Colombia, Guatemala
- **Moneda USD** — Formato Intl.NumberFormat con locale es-EC por defecto
- **Script CLI** — `scripts/create-admin.ts` para crear administradores via Supabase Admin API
- **proxy.ts** — Migración de middleware.ts a proxy.ts (estándar Next.js 16)

### Tecnologías
- Next.js 16.1.6 (Turbopack)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Supabase (Auth + PostgreSQL)
- Prisma 5.22.0
- Recharts
- jsPDF + jspdf-autotable
- Zod (validaciones)
