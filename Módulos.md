# Módulos del Dashboard

## Panel de Control
Vista general del negocio con indicadores clave: total de productos, ingresos, ganancia real, ventas realizadas, precio promedio y productos sin stock. Incluye gráficos de tendencia de ventas y distribución por categorías.

## Clientes
Gestión completa de clientes con validaciones ecuatorianas: cédula (10 dígitos), RUC (13 dígitos), celular (09XX, 10 dígitos) y teléfono fijo (02-07, 9 dígitos). Soporta búsqueda, edición y eliminación lógica.

## Ventas
Registro de ventas individuales con selección de producto, cantidad y precio unitario. Cálculo automático de totales. Historial con filtros por fecha y tipo.

## Compras
Registro de compras a proveedores con actualización automática del inventario. Historial filtrable por fecha.

## Pedidos
Gestión de pedidos en línea con estados: Pendiente, En proceso, Entregado. Vista de detalle con datos del cliente, dirección de entrega y desglose de productos.

## Productos
Catálogo completo con nombre, descripción, precio de venta, costo, stock, stock mínimo, categoría, marca y color. Gestión de categorías. Soporte para ofertas con precio especial.

## Inventario
Vista en tiempo real del stock con alertas visuales para productos con stock bajo (amarillo) o agotado (rojo).

## Facturación Electrónica
Emisión de facturas conforme al SRI Ecuador. Generación de XML v2.1.0, clave de acceso de 49 dígitos, PDF RIDE profesional. Los 8 métodos de pago de la Tabla 24 del SRI están soportados.

## Reportes
Resumen financiero con ingresos, costos, ganancia neta y margen. Gráficos interactivos. Exportación en CSV, PDF y Excel (.xlsx).

## Configuración
Perfil empresarial (RUC, razón social), sucursales, contacto, identidad visual, facturación electrónica (ambiente, establecimiento, punto de emisión), notificaciones por email y preferencias regionales (bloqueadas a Ecuador).

## Exportación

Todos los módulos que manejan datos tabulares incluyen un botón de exportación con tres formatos:

| Formato | Extensión | Uso |
|---------|-----------|-----|
| CSV | .csv | Importar en cualquier hoja de cálculo |
| PDF | .pdf | Reportes impresos con cabecera empresarial |
| Excel | .xlsx | Microsoft Excel con columnas auto-ajustadas |

---
© 2024-2026 Daniel Fernando Castillo Mera. Todos los derechos reservados.
