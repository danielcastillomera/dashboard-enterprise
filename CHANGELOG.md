# Changelog

Todos los cambios notables del proyecto se documentan en este archivo.

---

## [2.0.1] — 2026-03-01

### Corregido
- Fix crítico: generación de UUIDs en serverless (Vercel)
- Fix: `orders.updated_at` inexistente en SQL de defaults
- Fix: OperationGuard no disparaba `beforeunload` del navegador al cancelar
- Mejora en mensajes de error (visibles en FullScreenLoader y consola)

### Agregado
- Ruta `/api/health` para diagnóstico de deploy
- `.gitignore` profesional (Windows, macOS, IDEs, editors)
- `CHANGELOG.md` para tracking de versiones
- `DEPLOY.md` — guía completa de deploy a Vercel

### Mejorado
- DataTable: columna `#` (índice) y ordenamiento por columnas (asc/desc)
- Todas las API routes retornan errores descriptivos

---

## [2.0.0] — 2026-02-28

### Agregado
- **ProductSelector**: dropdown con imagen, búsqueda, precio y stock
- **FullScreenLoader**: estado de carga centrado en pantalla
- **OperationGuard**: bloqueo de navegación en operaciones críticas
- **Realtime Notifications**: Supabase Realtime con triggers automáticos
- DataTable con ordenamiento (sortable) y contador de filas
- Detalle de producto con modal, galería de imágenes y acciones

### Corregido
- Keys duplicadas en React (DataTable, Inventario, Pedidos)
- Toast API unificada (`variant` en lugar de `type`)
- Validación de env vars en cliente Supabase

---

## [1.0.0] — 2026-02-27

### Lanzamiento inicial
- Dashboard multi-tenant con Next.js 15 + Supabase + Prisma
- Autenticación enterprise (login, registro, recuperar contraseña)
- 5 módulos CRUD: Panel, Ventas, Compras, Productos, Pedidos
- Inventario con alertas de stock
- Temas claro/oscuro, exportación CSV/PDF
- Búsqueda global (Ctrl+K), RLS policies, WCAG 2.2
