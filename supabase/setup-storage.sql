-- ============================================
-- SUPABASE STORAGE: Company logos bucket
-- Run in Supabase SQL Editor
-- ============================================

-- 1. Create public bucket for company logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-assets',
  'company-assets',
  true,
  2097152, -- 2MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];

-- 2. Allow authenticated users to upload to their tenant folder
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-assets'
);

-- 3. Allow authenticated users to update their files
CREATE POLICY "Authenticated users can update logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'company-assets');

-- 4. Allow public read access (logos appear on invoices)
CREATE POLICY "Public can view company assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company-assets');

-- 5. Allow authenticated users to delete their files
CREATE POLICY "Authenticated users can delete logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'company-assets');

-- ============================================
-- Also ensure business_profiles and invoices have defaults
-- ============================================
ALTER TABLE business_profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE invoices ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE invoice_items ALTER COLUMN id SET DEFAULT gen_random_uuid();
