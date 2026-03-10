# Dashboard Enterprise

Sistema de gestión empresarial multi-tenant con facturación electrónica SRI Ecuador.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS 4 |
| Backend | Next.js API Routes, Server Actions |
| Base de datos | Supabase (PostgreSQL) + Prisma ORM |
| Autenticación | Supabase Auth |
| Email transaccional | Resend |
| Deployment | Vercel |

## Requisitos Previos

- Node.js >= 18.0
- npm >= 9.0
- Cuenta de Supabase (proyecto creado)
- Cuenta de Vercel (para producción)
- Cuenta de Resend (para emails — opcional en desarrollo)

## Instalación

```bash
# 1. Clonar repositorio
git clone https://github.com/danielcastillomera/dashboard-enterprise.git
cd dashboard-enterprise

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con sus credenciales

# 4. Generar cliente Prisma
npx prisma generate

# 5. Ejecutar migración en Supabase
# Copiar contenido de supabase/migration-v2.2.0-complete.sql
# y ejecutar en Supabase Dashboard > SQL Editor

# 6. Iniciar servidor de desarrollo
npm run dev
```

## Variables de Entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Base de datos
DATABASE_URL=postgresql://...
USE_REAL_DB=true

# Resend (Email)
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=facturacion@tu-dominio.com
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/          # Páginas de autenticación
│   ├── (dashboard)/     # Módulos del dashboard
│   │   ├── panel/       # Panel de Control
│   │   ├── clientes/    # Gestión de Clientes
│   │   ├── compras/     # Módulo de Compras
│   │   ├── ventas/      # Módulo de Ventas
│   │   ├── pedidos/     # Pedidos Online
│   │   ├── productos/   # Catálogo de Productos
│   │   ├── inventario/  # Control de Inventario
│   │   ├── facturacion/ # Facturación Electrónica SRI
│   │   ├── reportes/    # Reportes y Analíticas
│   │   └── configuracion/ # Configuración del Sistema
│   └── api/             # API Routes
├── components/
│   ├── layout/          # Sidebar, TopNav
│   └── ui/              # Componentes reutilizables
├── lib/
│   ├── billing/         # Lógica de facturación SRI
│   ├── email/           # Integración con Resend
│   ├── hooks/           # Custom hooks (useData)
│   └── db/              # Data source, queries
└── prisma/              # Schema de base de datos
```

## Módulos

- **Panel de Control** — KPIs, gráficos de ventas, resumen financiero
- **Clientes** — CRUD con validación de cédula/RUC Ecuador
- **Compras** — Registro de compras e inventario
- **Ventas** — Registro de ventas con selector de productos
- **Pedidos Online** — Gestión de pedidos con estados
- **Productos** — Catálogo con categorías, imágenes, precios
- **Inventario** — Control de stock, alertas de mínimo
- **Facturación** — Factura electrónica SRI (XML v2.1.0, clave de acceso)
- **Reportes** — Exportación CSV/PDF
- **Configuración** — Perfil empresarial, SRI, preferencias regionales

## Facturación Electrónica SRI

El módulo de facturación cumple con la normativa del Servicio de Rentas Internas de Ecuador:

- Generación de XML v2.1.0
- Clave de acceso de 49 dígitos (Módulo 11)
- Numeración secuencial sin gaps
- IVA 15%, 0%, No Objeto, Exento
- Formas de pago según Tabla 24 SRI
- Facturas emitidas son **inmutables** (no editables)
- Envío automático por email al momento de emitir

## Configuración de Resend (Email)

1. Crear cuenta en [resend.com](https://resend.com)
2. Obtener API Key desde el dashboard de Resend
3. Configurar dominio verificado (DNS: SPF, DKIM, DMARC)
4. Agregar variables de entorno:
   - `RESEND_API_KEY=re_xxxxxxxxxxxx`
   - `EMAIL_FROM=facturacion@tu-dominio.com`

## Despliegue en Vercel

```bash
# Push a GitHub (Vercel auto-deploy)
git add .
git commit -m "v2.2.0"
git push origin main
```

Configurar las variables de entorno en Vercel Dashboard > Settings > Environment Variables.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Iniciar producción |
| `npx prisma generate` | Generar cliente Prisma |
| `npx prisma db push` | Push schema a DB |

## Licencia

**Propiedad intelectual de Daniel Fernando Castillo Mera.**

Este software es privado y confidencial. Queda estrictamente prohibida la clonación, copia, distribución o uso no autorizado de este proyecto sin previo permiso escrito del titular. Ver archivo [LICENSE](./LICENSE) para términos completos.
