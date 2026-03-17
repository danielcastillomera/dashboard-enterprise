# Política de Seguridad

## Versiones soportadas

| Versión | Soportada          |
| ------- | ------------------ |
| 2.7.x   | :white_check_mark: |
| 2.6.x   | :white_check_mark: |
| < 2.6   | :x:                |

## Reportar una vulnerabilidad

Si descubres una vulnerabilidad de seguridad en Dashboard Enterprise, te agradecemos que la reportes de forma responsable.

**No abras un Issue público** para reportar vulnerabilidades de seguridad. En su lugar, envía un correo electrónico a:

**danielfcastillom@gmail.com**

Incluye la siguiente información en tu reporte:

- Descripción detallada de la vulnerabilidad.
- Pasos para reproducir el problema.
- Impacto potencial de la vulnerabilidad.
- Si es posible, una propuesta de solución.

## Tiempo de respuesta

- **Confirmación de recepción:** dentro de 48 horas.
- **Evaluación inicial:** dentro de 5 días hábiles.
- **Resolución:** dependiendo de la severidad, entre 7 y 30 días.

## Alcance

Esta política aplica a:

- El código fuente del repositorio `dashboard-enterprise`.
- La infraestructura de despliegue en Vercel.
- Las integraciones con Supabase (autenticación, base de datos).
- El módulo de facturación electrónica y generación de comprobantes.

## Fuera de alcance

- Vulnerabilidades en dependencias de terceros que ya tengan un CVE público (reportarlas directamente al mantenedor del paquete).
- Ataques de ingeniería social dirigidos a usuarios del sistema.
- Vulnerabilidades que requieran acceso físico al dispositivo del usuario.

## Medidas de seguridad implementadas

- **Autenticación:** Supabase Auth con tokens JWT y refresh automático.
- **Autorización:** Row Level Security (RLS) en PostgreSQL para aislamiento multi-tenant.
- **Headers HTTP:** X-Frame-Options, Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- **Cifrado:** HTTPS/TLS en tránsito. Datos sensibles cifrados en reposo por Supabase.
- **Protección de rutas:** Proxy de autenticación que intercepta todas las solicitudes a rutas protegidas.
- **Cumplimiento:** OWASP Top 10, LOPDP Ecuador.

## Reconocimiento

Reconocemos y agradecemos a quienes reporten vulnerabilidades de forma responsable. Con tu permiso, incluiremos tu nombre en una sección de agradecimientos.

---

© 2024-2026 Daniel Fernando Castillo Mera. Todos los derechos reservados.
