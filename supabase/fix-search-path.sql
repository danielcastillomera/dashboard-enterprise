/* ============================================
   FIX: Search Path Security Warnings
   
   Ejecutar en: Supabase Dashboard → SQL Editor
   Corrige las 4 warnings de "Function Search 
   Path Mutable" del Security Advisor.
   ============================================ */

-- Fix get_user_tenant_id
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS TEXT AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid()::text;
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public;

-- Fix notify_new_order
CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (title, message, type, href, tenant_id)
  VALUES (
    'Nuevo pedido',
    'Pedido de ' || NEW.client_name || ' por Q' || ROUND(NEW.total::numeric, 2),
    'order',
    '/pedidos',
    NEW.tenant_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Fix notify_low_stock
CREATE OR REPLACE FUNCTION public.notify_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock <= NEW.min_stock AND (OLD.stock > OLD.min_stock OR OLD.stock IS NULL) THEN
    IF NEW.stock = 0 THEN
      INSERT INTO public.notifications (title, message, type, href, tenant_id)
      VALUES (
        'Producto agotado',
        NEW.name || ' se ha quedado sin stock',
        'warning',
        '/inventario',
        NEW.tenant_id
      );
    ELSE
      INSERT INTO public.notifications (title, message, type, href, tenant_id)
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
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Fix notify_new_sale
CREATE OR REPLACE FUNCTION public.notify_new_sale()
RETURNS TRIGGER AS $$
DECLARE
  product_name TEXT;
BEGIN
  SELECT name INTO product_name FROM public.products WHERE id = NEW.product_id;
  INSERT INTO public.notifications (title, message, type, href, tenant_id)
  VALUES (
    'Venta registrada',
    product_name || ' — ' || NEW.quantity || ' uds por Q' || ROUND(NEW.total::numeric, 2),
    'success',
    '/ventas',
    NEW.tenant_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
