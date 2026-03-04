# Dashboard Enterprise

Sistema de gestión empresarial multi-industria construido con **Next.js 16**, **Supabase**, **Prisma** y **Tailwind CSS 4**. Incluye módulos de ventas, compras, inventario, pedidos, productos, clientes y facturación electrónica SRI Ecuador.

---

## Características Principales

- **Arquitectura Multi-Tenant** — Aislamiento por tenant con Supabase Auth y Row Level Security (RLS).
- **Módulos CRUD** — Ventas, Compras, Inventario, Pedidos, Productos y Clientes.
- **Facturación Electrónica SRI Ecuador** — Generación de XML v2.1.0, clave de acceso de 49 dígitos (Módulo 11), cálculo de IVA 15 %/0 %/No Objeto/Exento y numeración secuencial sin saltos.
- **Gestión de Clientes** — CRUD completo con validación ecuatoriana (Cédula, RUC, Pasaporte), teléfono fijo, celular y formato en tiempo real.
- **Vista Previa de Factura** — Modal estilo RIDE antes de emitir.
- **Email Transaccional** — Envío automático de facturas al cliente vía [Resend](https://resend.com).
- **Exportación PDF** — Generación de documentos con jsPDF y jsPDF-AutoTable.
- **Gráficos y Reportes** — Tendencia de ventas, productos más vendidos, categorías (Recharts).
- **Búsqueda Global** — Paleta de comandos con `Ctrl+K`.
- **Notificaciones en Tiempo Real** — Canal Supabase Realtime.
- **Tema Oscuro / Claro** — Cambia con un clic; usa CSS custom properties.
- **Diseño Responsivo** — Tarjetas en móvil, tablas en escritorio.

---

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS 4, PostCSS |
| Base de Datos | PostgreSQL (Supabase) |
| ORM | Prisma 5 |
| Autenticación | Supabase Auth + SSR |
| Email | Resend |
| Gráficos | Recharts |
| PDF | jsPDF + jsPDF-AutoTable |
| Validación | Zod |
| Iconos | Lucide React |
| Data Fetching | SWR + hooks personalizados |

---

## Requisitos Previos

- **Node.js** ≥ 18
- **npm** ≥ 9 (o pnpm / yarn)
- Una cuenta en [Supabase](https://supabase.com) (plan gratuito funciona)
- *(Opcional)* Cuenta en [Resend](https://resend.com) para emails de facturas
- *(Opcional)* Cuenta en [Vercel](https://vercel.com) para despliegue en producción

---

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/danielcastillomera/dashboard-enterprise.git
cd dashboard-enterprise
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```env
# ---- Supabase ----
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# ---- Base de Datos (Prisma) ----
DATABASE_URL=postgresql://postgres:password@db.tu-proyecto.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:password@db.tu-proyecto.supabase.co:5432/postgres

# ---- Modo de Datos ----
# true  = Supabase/Prisma (producción)
# false = datos mock (desarrollo/demo)
USE_REAL_DB=true

# ---- Email (Resend) ----
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@tudominio.com

# ---- URL de la App ----
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Consulta [`docs/RESEND_SETUP.md`](docs/RESEND_SETUP.md) para la guía completa de configuración de Resend.

### 4. Configurar la base de datos

```bash
# Sincronizar el esquema Prisma con Supabase
npm run db:push

# (Opcional) Poblar con datos iniciales
npm run db:seed
```

Luego ejecuta las migraciones SQL de Supabase en el **SQL Editor** del panel de Supabase, en este orden:

1. `supabase/rls-policies.sql` — Políticas de Row Level Security
2. `supabase/notifications-realtime.sql` — Canal de notificaciones en tiempo real
3. `supabase/setup-storage.sql` — Bucket de Storage para logos
4. `supabase/billing-migration-v2.1.0-DEFINITIVA.sql` — Tablas de facturación SRI
5. `supabase/patch-v2.1.1-celular.sql` — Columna celular en customers

### 5. Iniciar en modo desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo con Turbopack |
| `npm run build` | Genera el cliente Prisma y compila para producción |
| `npm run start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run db:push` | Sincroniza el esquema Prisma con la base de datos |
| `npm run db:seed` | Ejecuta el script de seed (`prisma/seed.ts`) |
| `npm run db:studio` | Abre Prisma Studio (interfaz visual de la BD) |
| `npm run db:reset` | Resetea la BD y ejecuta el seed |

---

## Estructura del Proyecto

```
dashboard-enterprise/
├── docs/                        # Documentación adicional
│   └── RESEND_SETUP.md          # Guía de configuración de Resend
├── prisma/
│   ├── schema.prisma            # Esquema principal de la BD
│   ├── schema-additions.prisma  # Extensiones al esquema
│   └── seed.ts                  # Datos iniciales
├── src/
│   ├── app/
│   │   ├── (auth)/              # Páginas de autenticación
│   │   │   ├── login/
│   │   │   ├── registro/
│   │   │   └── recuperar-password/
│   │   ├── (dashboard)/         # Módulos del dashboard
│   │   │   ├── panel/           # Panel principal
│   │   │   ├── clientes/        # Gestión de clientes
│   │   │   ├── compras/         # Módulo de compras
│   │   │   ├── ventas/          # Módulo de ventas
│   │   │   ├── pedidos/         # Módulo de pedidos
│   │   │   ├── productos/       # Módulo de productos
│   │   │   ├── inventario/      # Módulo de inventario
│   │   │   ├── facturacion/     # Facturación electrónica SRI
│   │   │   ├── reportes/        # Reportes y gráficos
│   │   │   └── configuracion/   # Configuración de empresa
│   │   ├── api/                 # API Routes (REST)
│   │   └── auth/callback/       # Callback de Supabase Auth
│   ├── components/
│   │   ├── charts/              # Gráficos (Recharts)
│   │   ├── invoice/             # Vista previa de factura
│   │   ├── layout/              # Header, Sidebar, Global Search
│   │   ├── providers/           # ThemeProvider
│   │   └── ui/                  # Componentes reutilizables
│   └── lib/
│       ├── actions/             # Server Actions
│       ├── billing/             # Lógica de facturación SRI
│       ├── db/                  # Data Source, queries, tenant
│       ├── email/               # Cliente Resend y templates
│       ├── hooks/               # Custom hooks (useData, useRealtimeNotifications)
│       ├── supabase/            # Clientes Supabase (client/server)
│       └── validations/         # Esquemas Zod
├── supabase/                    # Migraciones SQL
├── .env.example                 # Plantilla de variables de entorno
├── CHANGELOG.md                 # Historial de cambios
└── package.json
```

---

## Despliegue en Vercel

1. Importa el repositorio en [vercel.com/new](https://vercel.com/new).
2. En **Settings → Environment Variables** agrega todas las variables de `.env.example` con los valores de producción.
3. Vercel ejecutará `npm run build` automáticamente (incluye `prisma generate`).
4. Después de cada push a la rama principal se despliega de forma automática.

> Asegúrate de que la base de datos de Supabase sea accesible desde los servidores de Vercel (las IPs de Vercel no necesitan allowlist en Supabase por defecto).

---

## Documentación Adicional

| Documento | Descripción |
|-----------|-------------|
| [`docs/RESEND_SETUP.md`](docs/RESEND_SETUP.md) | Guía paso a paso para configurar el envío de emails con Resend |
| [`CHANGELOG.md`](CHANGELOG.md) | Historial detallado de cambios por versión |
| [`.env.example`](.env.example) | Plantilla con todas las variables de entorno necesarias |

---

## Licencia

Este proyecto es privado y de uso interno.
