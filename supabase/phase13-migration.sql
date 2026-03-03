-- ============================================
-- PHASE 13 MIGRATION — Billing, Clients, Settings
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- 1. Add SKU and code fields to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS code TEXT;

-- 2. Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trade_name TEXT,
  tax_id TEXT NOT NULL,
  tax_id_type TEXT NOT NULL DEFAULT 'NIT',
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'GT',
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tax_id, tenant_id)
);

-- 3. Create business_settings table
CREATE TABLE IF NOT EXISTS business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id),
  
  -- Company identity
  legal_name TEXT NOT NULL,
  trade_name TEXT,
  tax_id TEXT NOT NULL,
  tax_id_type TEXT NOT NULL DEFAULT 'NIT',
  special_taxpayer TEXT,
  accounting_required BOOLEAN NOT NULL DEFAULT false,
  
  -- Contact
  email TEXT,
  phone TEXT,
  website TEXT,
  
  -- Address
  main_address TEXT,
  branch_address TEXT,
  city TEXT,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'GT',
  
  -- Branding
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#F59E0B',
  
  -- Invoice defaults
  default_currency TEXT NOT NULL DEFAULT 'GTQ',
  default_tax_rate FLOAT NOT NULL DEFAULT 12,
  default_payment_terms TEXT NOT NULL DEFAULT 'Contado',
  invoice_series TEXT NOT NULL DEFAULT 'FAC',
  establishment_code TEXT NOT NULL DEFAULT '001',
  emission_point_code TEXT NOT NULL DEFAULT '001',
  next_sequential INT NOT NULL DEFAULT 1,
  
  -- Email settings
  email_from_name TEXT,
  email_footer_text TEXT,
  social_links JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL,
  series TEXT NOT NULL DEFAULT 'FAC',
  establishment TEXT NOT NULL DEFAULT '001',
  emission_point TEXT NOT NULL DEFAULT '001',
  sequential INT NOT NULL,
  
  -- Dates
  issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  
  -- Client data (denormalized)
  client_id UUID REFERENCES clients(id),
  client_name TEXT NOT NULL,
  client_tax_id TEXT NOT NULL,
  client_tax_id_type TEXT NOT NULL DEFAULT 'NIT',
  client_address TEXT,
  client_phone TEXT,
  client_email TEXT,
  
  -- Totals
  subtotal FLOAT NOT NULL DEFAULT 0,
  subtotal_taxable FLOAT NOT NULL DEFAULT 0,
  subtotal_exempt FLOAT NOT NULL DEFAULT 0,
  total_discount FLOAT NOT NULL DEFAULT 0,
  tax_amount FLOAT NOT NULL DEFAULT 0,
  tax_rate FLOAT NOT NULL DEFAULT 12,
  total FLOAT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'GTQ',
  
  -- Payment
  payment_method TEXT,
  payment_terms TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'DRAFT',
  authorization_number TEXT,
  environment TEXT NOT NULL DEFAULT 'PRODUCTION',
  
  -- Additional info
  notes TEXT,
  internal_notes TEXT,
  additional_info JSONB,
  
  -- File references
  pdf_url TEXT,
  xml_url TEXT,
  email_sent_at TIMESTAMPTZ,
  
  -- Relations
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(series, establishment, emission_point, sequential, tenant_id)
);

-- 5. Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  line_number INT NOT NULL,
  
  -- Product reference
  product_id UUID,
  product_code TEXT,
  aux_code TEXT,
  
  -- Item details
  description TEXT NOT NULL,
  quantity FLOAT NOT NULL,
  unit_price FLOAT NOT NULL,
  discount FLOAT NOT NULL DEFAULT 0,
  subtotal FLOAT NOT NULL,
  
  -- Tax
  taxable BOOLEAN NOT NULL DEFAULT true,
  tax_rate FLOAT NOT NULL DEFAULT 12,
  tax_amount FLOAT NOT NULL DEFAULT 0,
  total FLOAT NOT NULL,
  
  -- Additional details (como Multicines)
  additional_detail_1 TEXT,
  additional_detail_2 TEXT,
  additional_detail_3 TEXT
);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_status ON invoices(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_date ON invoices(tenant_id, issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_clients_tenant ON clients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clients_tax_id ON clients(tax_id, tenant_id);

-- 7. Enable RLS on new tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies — Clients
CREATE POLICY "Users can view clients of their tenant" ON clients
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert clients for their tenant" ON clients
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update clients of their tenant" ON clients
  FOR UPDATE USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete clients of their tenant" ON clients
  FOR DELETE USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- 9. RLS Policies — Invoices
CREATE POLICY "Users can view invoices of their tenant" ON invoices
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert invoices for their tenant" ON invoices
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update invoices of their tenant" ON invoices
  FOR UPDATE USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- 10. RLS Policies — Invoice Items (via invoice tenant)
CREATE POLICY "Users can view invoice items" ON invoice_items
  FOR SELECT USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert invoice items" ON invoice_items
  FOR INSERT WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update invoice items" ON invoice_items
  FOR UPDATE USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete invoice items" ON invoice_items
  FOR DELETE USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- 11. RLS Policies — Business Settings
CREATE POLICY "Users can view their tenant settings" ON business_settings
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update their tenant settings" ON business_settings
  FOR UPDATE USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert their tenant settings" ON business_settings
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- 12. Service role bypass policies (for API routes)
CREATE POLICY "Service role full access clients" ON clients
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access invoices" ON invoices
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access invoice_items" ON invoice_items
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access settings" ON business_settings
  FOR ALL USING (auth.role() = 'service_role');

-- 13. Create Supabase Storage bucket for company logos
-- Run this in Supabase Dashboard > Storage > New Bucket
-- Name: company-assets
-- Public: true
-- File size limit: 2MB
-- Allowed MIME types: image/png, image/jpeg, image/svg+xml, image/webp

-- 14. Updated_at trigger for auto-update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_settings_updated_at
  BEFORE UPDATE ON business_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
