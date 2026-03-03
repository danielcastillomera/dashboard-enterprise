/* ============================================
   FACTURACIÓN — Crear tablas
   Ejecutar en: Supabase Dashboard → SQL Editor
   ============================================ */

-- Business Profiles
CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id),
  business_name TEXT NOT NULL,
  trade_name TEXT,
  tax_id TEXT NOT NULL,
  tax_id_type TEXT NOT NULL DEFAULT 'NIT',
  address TEXT NOT NULL,
  branch_address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  special_taxpayer TEXT,
  keep_accounting BOOLEAN NOT NULL DEFAULT false,
  establishment TEXT NOT NULL DEFAULT '001',
  emission_point TEXT NOT NULL DEFAULT '001',
  environment TEXT NOT NULL DEFAULT 'PRODUCCION',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL,
  establishment TEXT NOT NULL DEFAULT '001',
  emission_point TEXT NOT NULL DEFAULT '001',
  sequential INTEGER NOT NULL,
  authorization_number TEXT,
  access_key TEXT,
  client_name TEXT NOT NULL,
  client_tax_id TEXT NOT NULL,
  client_tax_id_type TEXT NOT NULL DEFAULT 'NIT',
  client_address TEXT,
  client_phone TEXT,
  client_email TEXT,
  subtotal DOUBLE PRECISION NOT NULL,
  subtotal_iva DOUBLE PRECISION NOT NULL DEFAULT 0,
  subtotal_zero DOUBLE PRECISION NOT NULL DEFAULT 0,
  total_discount DOUBLE PRECISION NOT NULL DEFAULT 0,
  iva_rate DOUBLE PRECISION NOT NULL DEFAULT 12,
  iva_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  total DOUBLE PRECISION NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'EFECTIVO',
  status TEXT NOT NULL DEFAULT 'emitida',
  notes TEXT,
  issue_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  business_profile_id UUID NOT NULL REFERENCES business_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, sequential)
);

-- Invoice Items
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID,
  code TEXT,
  description TEXT NOT NULL,
  quantity DOUBLE PRECISION NOT NULL,
  unit_price DOUBLE PRECISION NOT NULL,
  discount DOUBLE PRECISION NOT NULL DEFAULT 0,
  subtotal DOUBLE PRECISION NOT NULL,
  iva_rate DOUBLE PRECISION NOT NULL DEFAULT 12
);

-- RLS Policies
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "business_profiles_tenant" ON business_profiles
  FOR ALL USING (tenant_id::text = public.get_user_tenant_id());

CREATE POLICY "invoices_tenant" ON invoices
  FOR ALL USING (tenant_id::text = public.get_user_tenant_id());

CREATE POLICY "invoice_items_tenant" ON invoice_items
  FOR ALL USING (
    invoice_id IN (SELECT id FROM invoices WHERE tenant_id::text = public.get_user_tenant_id())
  );

SELECT 'Invoice tables created successfully' as result;
