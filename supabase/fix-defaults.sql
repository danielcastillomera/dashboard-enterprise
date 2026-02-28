/* Fix all table column defaults - Ejecutar en Supabase SQL Editor */

-- Sales
ALTER TABLE sales ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE sales ALTER COLUMN date SET DEFAULT now();
ALTER TABLE sales ALTER COLUMN created_at SET DEFAULT now();

-- Purchases
ALTER TABLE purchases ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE purchases ALTER COLUMN date SET DEFAULT now();
ALTER TABLE purchases ALTER COLUMN created_at SET DEFAULT now();

-- Products
ALTER TABLE products ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE products ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE products ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE products ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE products ALTER COLUMN is_offer SET DEFAULT false;
ALTER TABLE products ALTER COLUMN min_stock SET DEFAULT 5;

-- Categories
ALTER TABLE categories ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Orders
ALTER TABLE orders ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pendiente';
ALTER TABLE orders ALTER COLUMN created_at SET DEFAULT now();

-- Order items
ALTER TABLE order_items ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Notifications
ALTER TABLE notifications ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE notifications ALTER COLUMN read SET DEFAULT false;
ALTER TABLE notifications ALTER COLUMN type SET DEFAULT 'info';
ALTER TABLE notifications ALTER COLUMN created_at SET DEFAULT now();

-- Profiles
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'admin';
ALTER TABLE profiles ALTER COLUMN created_at SET DEFAULT now();

-- Tenants
ALTER TABLE tenants ALTER COLUMN created_at SET DEFAULT now();

-- Fix get_user_tenant_id
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS TEXT AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid()::text;
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public;

SELECT 'All defaults applied successfully' as result;
