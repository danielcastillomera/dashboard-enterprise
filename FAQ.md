# Preguntas frecuentes

## General

**¿Qué navegadores son compatibles?**
Google Chrome 80+, Mozilla Firefox 78+, Microsoft Edge 80+, Safari 14+, Opera 67+ y Samsung Internet 13+.

**¿Puedo usar el sistema desde mi celular?**
Sí. El dashboard es responsive y se adapta a pantallas de celulares, tablets y computadores de escritorio.

**¿Necesito instalar algo en mi computador?**
No. El sistema funciona completamente en el navegador web. No requiere descargas ni instalaciones.

**¿En qué país opera el sistema?**
Actualmente está configurado exclusivamente para Ecuador, con moneda USD, zona horaria America/Guayaquil y cumplimiento normativo del SRI.

## Facturación

**¿Puedo emitir facturas legalmente válidas con este sistema?**
Actualmente el sistema genera facturas con formato correcto (XML SRI, clave de acceso, RIDE) para uso interno. La integración con los Web Services del SRI para autorización en línea está planificada para versiones futuras.

**¿Puedo anular una factura emitida?**
No. Según la normativa del SRI, las facturas emitidas no pueden ser anuladas. Si existe un error, se debe emitir una nota de crédito.

**¿Qué métodos de pago soporta?**
Los 8 métodos de la Tabla 24 del SRI: Efectivo, Tarjeta de débito, Tarjeta de crédito, Transferencia/Depósito bancario, Dinero electrónico, Tarjeta prepago, Compensación de deudas y Endoso de títulos.

## Datos y seguridad

**¿Mis datos están seguros?**
Sí. El sistema utiliza cifrado HTTPS, autenticación JWT, Row Level Security para aislamiento de datos y headers de seguridad OWASP.

**¿Otras empresas pueden ver mis datos?**
No. Cada empresa tiene sus datos completamente aislados mediante Row Level Security en la base de datos.

**¿Puedo exportar mis datos?**
Sí. Todos los módulos permiten exportar datos en formato CSV, PDF y Excel (.xlsx).

## Soporte

**¿Cómo reporto un error?**
Envíe un correo electrónico a danielfcastillom@gmail.com con la descripción del problema, capturas de pantalla y los pasos para reproducirlo.

**¿Cómo reporto una vulnerabilidad de seguridad?**
Consulte el archivo SECURITY.md en el repositorio. No abra Issues públicos para vulnerabilidades.

---
© 2024-2026 Daniel Fernando Castillo Mera. Todos los derechos reservados.
