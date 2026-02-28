/* ============================================
   NOTIFICATIONS TABLE + RLS + REALTIME
   
   Ejecutar en: Supabase Dashboard → SQL Editor
   ============================================ */

-- 1. Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  href TEXT,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS
CREATE POLICY "notification_select" ON notifications
  FOR SELECT TO authenticated
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "notification_insert" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "notification_update" ON notifications
  FOR UPDATE TO authenticated
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "notification_delete" ON notifications
  FOR DELETE TO authenticated
  USING (tenant_id = get_user_tenant_id());

-- 4. Habilitar Realtime en la tabla notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 5. Índice para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_read 
  ON notifications(tenant_id, read, created_at DESC);

-- ============================================
-- FUNCIÓN: Crear notificación automática 
-- cuando se inserta un nuevo pedido
-- ============================================
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (title, message, type, href, tenant_id)
  VALUES (
    'Nuevo pedido',
    'Pedido de ' || NEW.client_name || ' por Q' || ROUND(NEW.total::numeric, 2),
    'order',
    '/pedidos',
    NEW.tenant_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_order ON orders;
CREATE TRIGGER on_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();

-- ============================================
-- FUNCIÓN: Notificar stock bajo cuando se 
-- actualiza un producto
-- ============================================
CREATE OR REPLACE FUNCTION notify_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo notificar si el stock bajó al mínimo o menos
  IF NEW.stock <= NEW.min_stock AND (OLD.stock > OLD.min_stock OR OLD.stock IS NULL) THEN
    IF NEW.stock = 0 THEN
      INSERT INTO notifications (title, message, type, href, tenant_id)
      VALUES (
        'Producto agotado',
        NEW.name || ' se ha quedado sin stock',
        'warning',
        '/inventario',
        NEW.tenant_id
      );
    ELSE
      INSERT INTO notifications (title, message, type, href, tenant_id)
      VALUES (
        'Stock bajo',
        NEW.name || ' tiene solo ' || NEW.stock || ' unidades (mín: ' || NEW.min_stock || ')',
        'warning',
        '/inventario',
        NEW.tenant_id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_stock_change ON products;
CREATE TRIGGER on_stock_change
  AFTER UPDATE OF stock ON products
  FOR EACH ROW
  EXECUTE FUNCTION notify_low_stock();

-- ============================================
-- FUNCIÓN: Notificar nueva venta registrada
-- ============================================
CREATE OR REPLACE FUNCTION notify_new_sale()
RETURNS TRIGGER AS $$
DECLARE
  product_name TEXT;
BEGIN
  SELECT name INTO product_name FROM products WHERE id = NEW.product_id;
  INSERT INTO notifications (title, message, type, href, tenant_id)
  VALUES (
    'Venta registrada',
    product_name || ' — ' || NEW.quantity || ' uds por Q' || ROUND(NEW.total::numeric, 2),
    'success',
    '/ventas',
    NEW.tenant_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_sale ON sales;
CREATE TRIGGER on_new_sale
  AFTER INSERT ON sales
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_sale();

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecutar después para confirmar:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications';
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
