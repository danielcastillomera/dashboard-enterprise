# Facturación Electrónica

## Normativa aplicable

Dashboard Enterprise cumple con las especificaciones técnicas del Servicio de Rentas Internas (SRI) del Ecuador:

- Ficha Técnica de Comprobantes Electrónicos (esquema Offline).
- XML versión 2.1.0 para facturas.
- Tabla 24 — Formas de pago.
- IVA 15% vigente desde abril 2024.

## Formas de pago soportadas (Tabla 24 SRI)

| Código | Descripción en el sistema | Descripción técnica SRI |
|--------|--------------------------|------------------------|
| 01 | Efectivo | Sin utilización del sistema financiero |
| 15 | Compensación de deudas | Compensación de deudas |
| 16 | Tarjeta de débito | Tarjeta de débito |
| 17 | Dinero electrónico | Dinero electrónico |
| 18 | Tarjeta prepago | Tarjeta prepago |
| 19 | Tarjeta de crédito | Tarjeta de crédito |
| 20 | Transferencia / Depósito bancario | Otros con utilización del sistema financiero |
| 21 | Endoso de títulos | Endoso de títulos |

## Clave de acceso (49 dígitos)

Cada factura genera automáticamente una clave de acceso única con la siguiente estructura:

| Posición | Campo | Ejemplo |
|----------|-------|---------|
| 1-8 | Fecha emisión (DDMMAAAA) | 15032026 |
| 9-10 | Tipo comprobante | 01 |
| 11-23 | RUC emisor | 0990000000001 |
| 24 | Ambiente | 1 (Pruebas) |
| 25-30 | Serie | 001001 |
| 31-39 | Secuencial | 000000001 |
| 40-47 | Código numérico | 12345678 |
| 48 | Tipo emisión | 1 (Normal) |
| 49 | Dígito verificador | Módulo 11 |

## Documento RIDE (PDF)

El sistema genera un PDF profesional con:

- Datos completos del emisor y receptor.
- Número de factura y clave de acceso.
- Detalle de productos con cantidades, precios y descuentos.
- Desglose de impuestos (subtotal 15%, subtotal 0%, IVA).
- Forma de pago.
- Pie de página con autoría.

## Estado actual

El módulo actualmente genera facturas con formato correcto (XML, clave de acceso, RIDE) para uso interno. La integración con los Web Services SOAP del SRI para firma electrónica y autorización en línea está planificada para versiones futuras.

---
© 2024-2026 Daniel Fernando Castillo Mera. Todos los derechos reservados.
