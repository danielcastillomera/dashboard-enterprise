# Dashboard Enterprise — Sistema de Gestión

Dashboard empresarial modular y configurable construido con **Next.js 16**, **Supabase**, y **Prisma 5**. Diseñado siguiendo estándares enterprise de Stripe, Shopify y AWS Console.

## Características

- **Autenticación invite-only** — Sin registro público, admins se crean via CLI
- **Multi-módulo** — Panel, Ventas, Compras, Inventario, Pedidos, Productos, Reportes
- **Exportación funcional** — PDF y CSV con branding
- **Dark/Light mode** — Cambio automático con preferencias del sistema
- **WCAG 2.1/2.2** — Nivel A–AAA: skip-to-content, focus-visible, reduced motion, aria landmarks
- **Configurable** — Moneda, idioma, zona horaria, color de marca por tenant
- **Multi-país** — Plantillas para Ecuador, México, Colombia, Guatemala

## Tech Stack

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 16 | Framework full-stack |
| React | 19 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Estilos |
| Supabase | - | Auth + Base de datos |
| Prisma | 5 | ORM |
| Recharts | - | Gráficos |
| jsPDF | - | Exportación PDF |

## Requisitos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU-USUARIO/dashboard-enterprise.git
cd dashboard-enterprise

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# 4. Crear tablas en la base de datos
npx prisma db push

# 5. Sembrar datos de ejemplo
npx tsx prisma/seed.ts

# 6. Crear usuario admin
npx tsx scripts/create-admin.ts admin@empresa.com "Mi Nombre" MiContraseña123

# 7. Iniciar el servidor de desarrollo
npm run dev
```

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
USE_REAL_DB=true
```

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/          # Login, recuperar contraseña
│   ├── (dashboard)/     # Panel, Ventas, Compras, etc.
│   └── globals.css      # Design system (CSS variables)
├── components/
│   ├── charts/          # Recharts wrappers
│   ├── layout/          # Header, Sidebar
│   ├── providers/       # Theme provider
│   └── ui/              # Button, Card, DataTable, etc.
├── lib/
│   ├── actions/         # Server actions (auth, CRUD)
│   ├── db/              # Queries Prisma
│   ├── supabase/        # Client/Server helpers
│   ├── export-utils.ts  # PDF/CSV export
│   ├── tenant-config.ts # Configuración del negocio
│   └── mock-data.ts     # Datos demo
└── types/               # TypeScript types
```

## Crear admin por CLI

```bash
# Requiere SUPABASE_SERVICE_ROLE_KEY en .env.local
npx tsx scripts/create-admin.ts email@empresa.com "Nombre" contraseña
```

## Configurar para otro país

Editar `src/lib/tenant-config.ts`:

```typescript
export const ferreteriaConfig: TenantConfig = {
  ...defaultTenantConfig,
  locale: "es-MX",       // Cambiar locale
  currency: "MXN",       // Cambiar moneda
  timezone: "America/Mexico_City",
};
```

## Accesibilidad (WCAG)

| Criterio | Nivel | Estado |
|---|---|---|
| 2.4.1 Skip to content | A | ✅ |
| 2.4.7 Focus visible | AA | ✅ |
| 1.4.3 Contraste mínimo | AA | ✅ |
| 1.4.6 Contraste mejorado | AAA | ✅ |
| 2.5.8 Target size | AAA | ✅ |
| 1.3.1 Info and relationships | A | ✅ |
| 2.3.3 Reduced motion | AAA | ✅ |

## Licencia

MIT
