# Seguridad

## Headers HTTP (OWASP)

El sistema implementa los siguientes headers de seguridad recomendados por OWASP:

| Header | Valor | Propósito |
|--------|-------|-----------|
| X-Frame-Options | SAMEORIGIN | Previene ataques de clickjacking |
| X-Content-Type-Options | nosniff | Previene MIME sniffing |
| X-XSS-Protection | 1; mode=block | Protección XSS en navegadores legacy |
| Strict-Transport-Security | max-age=31536000 | Fuerza conexiones HTTPS |
| Referrer-Policy | strict-origin-when-cross-origin | Controla la información del referrer |
| Permissions-Policy | camera=(), microphone=() | Desactiva APIs de hardware no usadas |
| Content-Security-Policy | (ver detalle) | Restringe orígenes de contenido |

## Autenticación

- Supabase Auth gestiona usuarios con tokens JWT.
- Refresh automático de sesiones expiradas.
- El archivo `src/proxy.ts` intercepta todas las solicitudes y redirige a usuarios no autenticados a `/login`.
- Las rutas públicas (store, login, registro, auth/callback) están explícitamente permitidas.

## Aislamiento de datos (Multi-tenant)

- Cada tabla de negocio tiene una columna `tenant_id`.
- Row Level Security (RLS) en PostgreSQL filtra datos automáticamente.
- Las API Routes verifican el `tenantId` del usuario autenticado antes de cualquier operación.
- Un usuario nunca puede acceder a datos de otro tenant.

## Cumplimiento legal

- **LOPDP Ecuador:** Protección de datos desde el diseño, cifrado en tránsito, sin cookies de terceros.
- **OWASP Top 10:** Headers de seguridad, validación de inputs, protección contra XSS e inyección.
- **Dashboard privado:** `robots: { index: false, follow: false }` impide la indexación por motores de búsqueda.

## Reportar vulnerabilidades

Consulte el archivo [SECURITY.md](../blob/main/SECURITY.md) para instrucciones sobre cómo reportar vulnerabilidades de forma responsable.

---
© 2024-2026 Daniel Fernando Castillo Mera. Todos los derechos reservados.
