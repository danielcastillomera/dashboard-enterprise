/* ============================================
   PATCH v2.1.1 — Add celular column to customers
   Ejecutar en: Supabase Dashboard > SQL Editor
   DESPUES de haber ejecutado billing-migration-v2.1.0
   ============================================ */

-- Add celular column (required for Ecuador mobile numbers)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS celular VARCHAR(15);

-- Make direccion NOT NULL with default
ALTER TABLE customers ALTER COLUMN direccion SET DEFAULT '';

-- Make email NOT NULL with default
ALTER TABLE customers ALTER COLUMN email SET DEFAULT '';

SELECT 'Patch v2.1.1 applied — celular column added' as result;
