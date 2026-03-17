# Arquitectura del sistema

## Vista general

Dashboard Enterprise utiliza una arquitectura moderna basada en componentes con renderizado del lado del servidor (SSR) y una base de datos PostgreSQL gestionada por Supabase.

## Stack tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| Frontend | Next.js 16 + React 19 | Interfaz de usuario con SSR |
| Lenguaje | TypeScript | Tipado estático para seguridad |
| Estilos | Tailwind CSS 4 | Sistema de diseño utilitario |
| Base de datos | PostgreSQL 15 (Supabase) | Almacenamiento relacional |
| ORM | Prisma 5.22 | Acceso tipado a la base de datos |
| Autenticación | Supabase Auth | Gestión de usuarios y sesiones |
| PDF | @react-pdf/renderer | Generación de documentos RIDE |
| Email | Resend | Envío de facturas por correo |
| Despliegue | Vercel | Hosting con CI/CD automático |

## Multi-tenancy

El sistema usa una arquitectura multi-tenant con base de datos compartida. Cada tabla de datos de negocio tiene una columna `tenant_id` que aísla los datos entre empresas.

La seguridad se garantiza en tres niveles:

1. **Row Level Security (RLS):** PostgreSQL filtra automáticamente los datos por tenant.
2. **Server-side:** Cada API Route verifica la sesión y el `tenantId` del usuario.
3. **Proxy:** El archivo `src/proxy.ts` protege todas las rutas del dashboard.

## Estructura de archivos

```
src/
├── app/
│   ├── (auth)/           → Páginas de login, registro
│   ├── (dashboard)/      → Módulos del dashboard (10 módulos)
│   └── api/              → API Routes (backend)
├── components/
│   ├── layout/           → Sidebar, Header, GlobalSearch
│   ├── ui/               → Botones, Cards, Modales, Toasts
│   └── charts/           → Gráficos con Recharts
├── lib/
│   ├── billing/          → Facturación SRI (XML, clave acceso, RIDE)
│   ├── db/               → Consultas y data source
│   └── hooks/            → Custom hooks (useData, useExport)
└── prisma/               → Schema de base de datos
```

---
© 2024-2026 Daniel Fernando Castillo Mera. Todos los derechos reservados.
