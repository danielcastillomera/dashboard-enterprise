/* ============================================
   BILLING MODULE MIGRATION — FIXED
   Ejecutar en: Supabase Dashboard → SQL Editor
   Nota: tenants.id es TEXT, no UUID
   ============================================ */

-- Add code column to products if not exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS code VARCHAR(25);

-- Create customers table (tenant_id is TEXT to match tenants.id)
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  tipo_identificacion VARCHAR(2) DEFAULT '05',
  identificacion VARCHAR(20) NOT NULL,
  razon_social VARCHAR(300) NOT NULL,
  direccion VARCHAR(300),
  telefono VARCHAR(20),
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, identificacion)
);

-- Update business_profiles to SRI format
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS ruc VARCHAR(13);
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS razon_social VARCHAR(300);
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS nombre_comercial VARCHAR(300);
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS direccion_matriz VARCHAR(300);
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS direccion_sucursal VARCHAR(300);
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS ambiente VARCHAR(20) DEFAULT 'PRUEBAS';
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS tipo_emision VARCHAR(20) DEFAULT 'NORMAL';
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS obligado_contabilidad BOOLEAN DEFAULT false;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS contribuyente_especial VARCHAR(13);
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS regimen_rimpe BOOLEAN DEFAULT false;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS iva_rate FLOAT DEFAULT 15;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS current_sequential INTEGER DEFAULT 0;

-- Migrate old columns if they exist
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='business_profiles' AND column_name='business_name') THEN
    UPDATE business_profiles SET razon_social = business_name WHERE razon_social IS NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='business_profiles' AND column_name='tax_id') THEN
    UPDATE business_profiles SET ruc = tax_id WHERE ruc IS NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='business_profiles' AND column_name='address') THEN
    UPDATE business_profiles SET direccion_matriz = address WHERE direccion_matriz IS NULL;
  END IF;
END $$;

-- Drop old invoice tables and recreate
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;

-- Create invoices table (SRI compliant, all FKs as TEXT)
CREATE TABLE invoices (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  business_profile_id TEXT NOT NULL REFERENCES business_profiles(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  invoice_number VARCHAR(17) NOT NULL,
  establishment VARCHAR(3) DEFAULT '001',
  emission_point VARCHAR(3) DEFAULT '001',
  sequential INTEGER NOT NULL,
  clave_acceso VARCHAR(49) UNIQUE,
  numero_autorizacion VARCHAR(49),
  fecha_emision DATE NOT NULL,
  fecha_autorizacion TIMESTAMPTZ,
  ambiente VARCHAR(20) DEFAULT 'PRUEBAS',
  tipo_emision VARCHAR(20) DEFAULT 'NORMAL',
  subtotal_sin_impuestos FLOAT DEFAULT 0,
  subtotal_15 FLOAT DEFAULT 0,
  subtotal_0 FLOAT DEFAULT 0,
  subtotal_no_objeto FLOAT DEFAULT 0,
  subtotal_exento FLOAT DEFAULT 0,
  total_descuento FLOAT DEFAULT 0,
  ice FLOAT DEFAULT 0,
  iva_15 FLOAT DEFAULT 0,
  irbpnr FLOAT DEFAULT 0,
  propina FLOAT DEFAULT 0,
  importe_total FLOAT DEFAULT 0,
  forma_pago VARCHAR(2) DEFAULT '01',
  forma_pago_descripcion VARCHAR(100),
  plazo INTEGER DEFAULT 0,
  estado VARCHAR(20) DEFAULT 'CREADA',
  xml_generado TEXT,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  notes TEXT,
  order_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, establishment, emission_point, sequential)
);

CREATE INDEX idx_invoices_clave ON invoices(clave_acceso);
CREATE INDEX idx_invoices_fecha ON invoices(fecha_emision);
CREATE INDEX idx_invoices_estado ON invoices(estado);

-- Create invoice_items table (SRI compliant)
CREATE TABLE invoice_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  codigo_principal VARCHAR(25) NOT NULL,
  codigo_auxiliar VARCHAR(25),
  descripcion VARCHAR(300) NOT NULL,
  cantidad FLOAT NOT NULL,
  precio_unitario FLOAT NOT NULL,
  descuento FLOAT DEFAULT 0,
  precio_total_sin_impuesto FLOAT NOT NULL,
  iva_code VARCHAR(5) DEFAULT '4',
  iva_tarifa FLOAT DEFAULT 15,
  iva_base_imponible FLOAT DEFAULT 0,
  iva_valor FLOAT DEFAULT 0,
  orden INTEGER DEFAULT 0
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop first if exist to avoid conflicts)
DROP POLICY IF EXISTS "customers_tenant" ON customers;
DROP POLICY IF EXISTS "invoices_tenant" ON invoices;
DROP POLICY IF EXISTS "invoice_items_tenant" ON invoice_items;

CREATE POLICY "customers_tenant" ON customers
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()::text));

CREATE POLICY "invoices_tenant" ON invoices
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()::text));

CREATE POLICY "invoice_items_tenant" ON invoice_items
  FOR ALL USING (invoice_id IN (
    SELECT id FROM invoices WHERE tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()::text
    )
  ));

SELECT 'Billing migration complete ✅' as result;
