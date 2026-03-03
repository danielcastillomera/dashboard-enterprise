/* ============================================
   ROW LEVEL SECURITY (RLS) — SUPABASE
   
   Corrige los 8 errores de seguridad detectados.
   Nombres de tablas según Prisma @@map()
   
   EJECUTAR EN: Supabase Dashboard → SQL Editor
   ============================================ */

-- ========================================
-- 1. HABILITAR RLS EN TODAS LAS TABLAS
-- ========================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. FUNCIÓN HELPER: obtener tenant del usuario
-- ========================================

CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS TEXT AS $$
  SELECT tenant_id FROM profiles 
  WHERE id = auth.uid()::TEXT
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ========================================
-- 3. POLÍTICAS PARA tenants
-- ========================================

CREATE POLICY "tenant_select" ON tenants
  FOR SELECT TO authenticated
  USING (id = get_user_tenant_id());

-- ========================================
-- 4. POLÍTICAS PARA profiles
-- ========================================

CREATE POLICY "profile_select" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid()::TEXT);

CREATE POLICY "profile_update" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid()::TEXT)
  WITH CHECK (id = auth.uid()::TEXT);

-- ========================================
-- 5. POLÍTICAS PARA categories
-- ========================================

CREATE POLICY "category_select" ON categories
  FOR SELECT TO authenticated
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "category_insert" ON categories
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "category_update" ON categories
  FOR UPDATE TO authenticated
  USING (tenant_id = get_user_tenant_id())
  WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "category_delete" ON categories
  FOR DELETE TO authenticated
  USING (tenant_id = get_user_tenant_id());

-- ========================================
-- 6. POLÍTICAS PARA products
-- ========================================

CREATE POLICY "product_select" ON products
  FOR SELECT TO authenticated
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "product_insert" ON products
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "product_update" ON products
  FOR UPDATE TO authenticated
  USING (tenant_id = get_user_tenant_id())
  WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "product_delete" ON products
  FOR DELETE TO authenticated
  USING (tenant_id = get_user_tenant_id());

-- ========================================
-- 7. POLÍTICAS PARA sales
-- ========================================

CREATE POLICY "sale_select" ON sales
  FOR SELECT TO authenticated
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "sale_insert" ON sales
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = get_user_tenant_id());

-- ========================================
-- 8. POLÍTICAS PARA purchases
-- ========================================

CREATE POLICY "purchase_select" ON purchases
  FOR SELECT TO authenticated
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "purchase_insert" ON purchases
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = get_user_tenant_id());

-- ========================================
-- 9. POLÍTICAS PARA orders
-- ========================================

CREATE POLICY "order_select" ON orders
  FOR SELECT TO authenticated
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "order_insert" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "order_update" ON orders
  FOR UPDATE TO authenticated
  USING (tenant_id = get_user_tenant_id())
  WITH CHECK (tenant_id = get_user_tenant_id());

-- ========================================
-- 10. POLÍTICAS PARA order_items
-- ========================================

CREATE POLICY "orderitem_select" ON order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id
      AND orders.tenant_id = get_user_tenant_id()
    )
  );

CREATE POLICY "orderitem_insert" ON order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id
      AND orders.tenant_id = get_user_tenant_id()
    )
  );

-- ========================================
-- VERIFICACIÓN
-- ========================================
-- Ejecutar después para confirmar:
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public';
