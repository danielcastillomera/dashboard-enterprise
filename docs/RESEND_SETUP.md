# Guía de Configuración de Resend — Email Transaccional

Esta guía cubre la configuración completa de **Resend** para el envío automático de facturas electrónicas por email en Dashboard Enterprise.

---

## Tabla de Contenidos

1. [Requisitos Previos](#1-requisitos-previos)
2. [Obtener la API Key de Resend](#2-obtener-la-api-key-de-resend)
3. [Agregar y Verificar un Dominio en Resend](#3-agregar-y-verificar-un-dominio-en-resend)
4. [Configurar Variables de Entorno Localmente](#4-configurar-variables-de-entorno-localmente)
5. [Configurar Variables de Entorno en Vercel](#5-configurar-variables-de-entorno-en-vercel)
6. [¿Hay que Modificar Algo en Supabase?](#6-hay-que-modificar-algo-en-supabase)
7. [Probar el Envío de Emails](#7-probar-el-envío-de-emails)
8. [Solución de Problemas](#8-solución-de-problemas)

---

## 1. Requisitos Previos

- ✅ Cuenta en [Resend](https://resend.com) (ya iniciaste sesión con GitHub).
- ✅ Un dominio propio (ejemplo: `tuempresa.com`) con acceso a la configuración DNS.
  - Si **no** tienes un dominio propio, puedes usar el dominio de prueba de Resend (`onboarding@resend.dev`) que solo envía emails a la dirección asociada a tu cuenta de Resend.
- ✅ Proyecto desplegado en Vercel (o entorno local con `.env.local`).

---

## 2. Obtener la API Key de Resend

1. Ve a [https://resend.com/api-keys](https://resend.com/api-keys).
2. Haz clic en **"Create API Key"** (botón en la esquina superior derecha).
3. Configura la nueva API Key:
   - **Name**: `dashboard-enterprise` (o el nombre que prefieras para identificarla).
   - **Permission**: Selecciona **"Sending access"** (solo necesita enviar emails).
   - **Domain**: Selecciona tu dominio verificado, o **"All domains"** si aún no has verificado uno.
4. Haz clic en **"Add"**.
5. **Copia la API Key generada** (empieza con `re_`). ⚠️ Solo se muestra una vez, guárdala en un lugar seguro.

Ejemplo de API Key:
```
re_AbCdEfGh_1234567890abcdef
```

---

## 3. Agregar y Verificar un Dominio en Resend

> **¿Por qué?** Para enviar emails desde una dirección como `noreply@tuempresa.com` necesitas verificar que eres dueño del dominio. Sin verificación, solo puedes enviar desde `onboarding@resend.dev` a tu propio email.

### Paso a paso:

1. Ve a [https://resend.com/domains](https://resend.com/domains).
2. Haz clic en **"Add Domain"**.
3. Ingresa tu dominio (ejemplo: `tuempresa.com`) y haz clic en **"Add"**.
4. Resend te mostrará **registros DNS** que debes agregar en tu proveedor de dominio. Típicamente son:

   | Tipo    | Nombre/Host                    | Valor                                      | Propósito          |
   |---------|-------------------------------|--------------------------------------------|--------------------|
   | TXT     | `send._domainkey`             | `v=DKIM1; k=rsa; p=MIGfMA0GCS...`         | Firma DKIM         |
   | TXT     | `@` o vacío                   | `v=spf1 include:amazonses.com ~all`        | SPF (autenticación)|
   | MX      | `bounce` (o según Resend)     | `feedback-smtp.resend.com`                 | Manejo de rebotes  |

   > ⚠️ Los valores y nombres exactos los proporciona Resend en la pantalla de verificación de dominio. Cópialos tal cual desde ahí, ya que pueden variar.

5. **Agrega los registros DNS** en tu proveedor de dominio:
   - Si usas **Namecheap**: Panel > Domain List > Manage > Advanced DNS.
   - Si usas **Cloudflare**: DNS > Records > Add Record.
   - Si usas **GoDaddy**: DNS Management > Add Record.
   - Si usas **Google Domains**: DNS > Custom Records.
   - Si usas otro proveedor, busca la sección de registros DNS.

6. Regresa a [https://resend.com/domains](https://resend.com/domains) y haz clic en **"Verify"** junto a tu dominio.
   - La verificación DNS puede tardar entre **5 minutos y 72 horas** dependiendo de tu proveedor.
   - Resend verifica automáticamente cada cierto tiempo, pero puedes forzar la verificación manual.

7. Una vez verificado, verás el estado **"Verified" ✅** junto a tu dominio.

---

## 4. Configurar Variables de Entorno Localmente

1. Copia `.env.example` a `.env.local` (si aún no lo has hecho):
   ```bash
   cp .env.example .env.local
   ```

2. Edita `.env.local` y actualiza las siguientes variables:
   ```env
   # ---- Email (Resend) ----
   RESEND_API_KEY=re_TU_API_KEY_AQUI
   EMAIL_FROM=noreply@tuempresa.com
   ```

   - **`RESEND_API_KEY`**: La API Key que copiaste en el paso 2.
   - **`EMAIL_FROM`**: La dirección de envío. Debe usar el dominio que verificaste en el paso 3.
     - Ejemplo con dominio verificado: `noreply@tuempresa.com`
     - Ejemplo sin dominio (solo pruebas): `onboarding@resend.dev`

---

## 5. Configurar Variables de Entorno en Vercel

Para que los emails funcionen en producción, debes configurar las mismas variables en Vercel:

1. Ve a [https://vercel.com](https://vercel.com) e ingresa a tu proyecto **dashboard-enterprise**.
2. Ve a **Settings** > **Environment Variables**.
3. Agrega las siguientes variables:

   | Variable           | Valor                                | Entornos                            |
   |-------------------|--------------------------------------|--------------------------------------|
   | `RESEND_API_KEY`  | `re_TU_API_KEY_AQUI`                | Production, Preview, Development    |
   | `EMAIL_FROM`      | `noreply@tuempresa.com`             | Production, Preview, Development    |

4. Haz clic en **"Save"** para cada variable.
5. **Redespliega** la aplicación para que tome las nuevas variables:
   - Ve a **Deployments** > selecciona el último despliegue > haz clic en **"Redeploy"**.
   - O haz un nuevo push a la rama principal para que se despliegue automáticamente.

---

## 6. ¿Hay que Modificar Algo en Supabase?

**No.** El envío de emails de facturas se maneja completamente a través de **Resend** y no tiene relación con Supabase Auth ni con los servicios de email de Supabase.

La relación entre los servicios es:

| Servicio    | Responsabilidad                                             |
|------------|--------------------------------------------------------------|
| **Supabase** | Base de datos (PostgreSQL), autenticación de usuarios, RLS  |
| **Resend**   | Envío de emails transaccionales (facturas a clientes)       |
| **Vercel**   | Hosting, variables de entorno, ejecución de las API Routes  |

> **Nota**: Supabase tiene su propio servicio de email para autenticación (confirmación de cuenta, reset de contraseña), pero ese es independiente y se configura en el panel de Supabase Auth, no está relacionado con el envío de facturas.

---

## 7. Probar el Envío de Emails

### Opción A: Prueba rápida con dominio de prueba (sin dominio propio)

Si aún no tienes dominio verificado, puedes probar con la dirección de prueba de Resend:

1. En `.env.local`, configura:
   ```env
   RESEND_API_KEY=re_TU_API_KEY
   EMAIL_FROM=onboarding@resend.dev
   ```
2. Inicia la aplicación: `npm run dev`.
3. Crea una factura desde el módulo de **Facturación** con un cliente cuyo email sea **la dirección asociada a tu cuenta de Resend** (la misma de GitHub).
4. Al emitir la factura, se enviará automáticamente el email con los detalles.

> ⚠️ El dominio `onboarding@resend.dev` solo puede enviar emails a tu propio correo de Resend.

### Opción B: Prueba con dominio verificado

1. Verifica tu dominio (paso 3).
2. En `.env.local`, configura:
   ```env
   RESEND_API_KEY=re_TU_API_KEY
   EMAIL_FROM=noreply@tuempresa.com
   ```
3. Crea una factura con cualquier email de cliente. El email llegará con la dirección de envío de tu dominio.

### Verificar en Resend

- Ve a [https://resend.com/emails](https://resend.com/emails) para ver el historial de todos los emails enviados, su estado (delivered, bounced, etc.) y los detalles de cada envío.

---

## 8. Solución de Problemas

### El email no se envía

| Problema | Solución |
|----------|----------|
| `⚠️ RESEND_API_KEY no configurado` en la consola | Verifica que `RESEND_API_KEY` esté definido en `.env.local` (local) o en Vercel (producción). |
| `⚠️ Cliente sin email` en la consola | El cliente de la factura no tiene email registrado. Edita el cliente y agrega su email. |
| Error 403 de Resend | La API Key no tiene permisos o fue revocada. Genera una nueva en [resend.com/api-keys](https://resend.com/api-keys). |
| Error "domain not verified" | Tu dominio aún no está verificado. Revisa el estado en [resend.com/domains](https://resend.com/domains). |
| Email enviado pero no llega | Revisa la carpeta de spam. También verifica en [resend.com/emails](https://resend.com/emails) si el email fue entregado o rebotó. |

### El email llega a spam

- Asegúrate de que los registros DNS (SPF, DKIM) estén correctos.
- En Resend, verifica que el dominio muestre **SPF ✅** y **DKIM ✅**.

---

## Resumen de Variables de Entorno

```env
# ---- Email (Resend) ----
RESEND_API_KEY=re_xxxxx          # API Key de https://resend.com/api-keys
EMAIL_FROM=noreply@tuempresa.com  # Dirección de envío (dominio verificado en Resend)
```

Estas variables se necesitan en:
- **`.env.local`** — para desarrollo local
- **Vercel > Settings > Environment Variables** — para producción

No se requiere configuración adicional en **Supabase** ni en **Prisma**.
