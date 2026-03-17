# Inicio rápido

## Requisitos previos

- Node.js 18 o superior
- Cuenta en [Supabase](https://supabase.com) (plan gratuito)
- Cuenta en [Vercel](https://vercel.com) (plan gratuito)
- Git instalado en su computador

## Instalación local

```bash
# 1. Clonar el repositorio
git clone https://github.com/danielcastillomera/dashboard-enterprise.git
cd dashboard-enterprise

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con sus credenciales de Supabase

# 4. Generar el cliente de Prisma
npx prisma generate

# 5. Ejecutar la migración de base de datos
# (Copiar el contenido de supabase/migration-v2.2.0-complete.sql
#  y ejecutarlo en el SQL Editor de Supabase)

# 6. Iniciar el servidor de desarrollo
npm run dev
```

El sistema estará disponible en `http://localhost:3000`.

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de su proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (solo servidor) |
| `DATABASE_URL` | Cadena de conexión PostgreSQL |
| `USE_REAL_DB` | `true` para usar base de datos real |

## Despliegue en Vercel

1. Conecte su repositorio de GitHub con Vercel.
2. Configure las variables de entorno en el dashboard de Vercel.
3. Vercel detectará automáticamente que es un proyecto Next.js y lo desplegará.

---
© 2024-2026 Daniel Fernando Castillo Mera. Todos los derechos reservados.
