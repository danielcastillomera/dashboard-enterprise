# Deploy a Vercel — Dashboard Enterprise v2.0

## Paso 1: Crear cuenta en Vercel
1. Ir a [vercel.com](https://vercel.com)
2. Clic en **Sign Up** → **Continue with GitHub**
3. Autorizar acceso a tu cuenta de GitHub

## Paso 2: Subir código a GitHub
Desde la terminal, en la carpeta del proyecto:

```bash
cd dashboard-enterprise
git add .
git commit -m "v2.0.0 - Realtime notifications, operation guard, product selector, sortable tables"
git tag v2.0.0
git push origin main
git push origin v2.0.0
```

## Paso 3: Importar proyecto en Vercel
1. En Vercel Dashboard → **Add New** → **Project**
2. Seleccionar el repo **dashboard-enterprise**
3. Framework Preset: **Next.js** (auto-detectado)
4. **NO modificar** Build Command ni Output Directory

## Paso 4: Configurar Variables de Entorno
En la sección **Environment Variables**, agregar TODAS estas:

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tu-proyecto.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu anon key de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Tu service role key |
| `DATABASE_URL` | Tu connection string (pooler, puerto 6543) |
| `DIRECT_URL` | Tu connection string (directa, puerto 5432) |
| `USE_REAL_DB` | `true` |
| `NEXT_PUBLIC_APP_URL` | `https://tu-dominio.vercel.app` |

> ⚠️ Copiar los valores exactos de tu `.env.local`
> ⚠️ `NEXT_PUBLIC_APP_URL` debe ser la URL de Vercel (la obtenés después del primer deploy)

## Paso 5: Deploy
1. Clic en **Deploy**
2. Esperar ~2 minutos
3. Vercel te dará una URL como: `https://dashboard-enterprise-xxxxx.vercel.app`

## Paso 6: Configurar URL de producción
1. Copiar la URL que Vercel te dio
2. En Vercel → Settings → Environment Variables → Editar `NEXT_PUBLIC_APP_URL` con la URL real
3. **Redeploy**: Vercel Dashboard → Deployments → ... → Redeploy

## Paso 7: Configurar Supabase para producción
En Supabase Dashboard → Authentication → URL Configuration:
1. **Site URL**: `https://tu-dominio.vercel.app`
2. **Redirect URLs**: agregar `https://tu-dominio.vercel.app/auth/callback`

## Paso 8 (opcional): Dominio personalizado
1. Vercel → Settings → Domains → Add
2. Escribir tu dominio (ej: `mitienda.com`)
3. Configurar los DNS según las instrucciones de Vercel
4. Actualizar `NEXT_PUBLIC_APP_URL` y Supabase Redirect URLs con el nuevo dominio
