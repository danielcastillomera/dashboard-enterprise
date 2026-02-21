/* ============================================
   CREAR USUARIO ADMINISTRADOR — CLI
   Patrón enterprise (Stripe/Shopify/AWS):
   Los admins se crean por línea de comando,
   nunca por registro público.
   
   Uso:
   npx tsx scripts/create-admin.ts admin@empresa.com "Mi Nombre" contraseña123
   ============================================ */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Error: Variables de entorno requeridas:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL");
  console.error("   SUPABASE_SERVICE_ROLE_KEY");
  console.error("");
  console.error("Configúralas en .env.local o como variables de entorno.");
  process.exit(1);
}

const args = process.argv.slice(2);

if (args.length < 3) {
  console.log("");
  console.log("📋 Crear usuario administrador");
  console.log("─────────────────────────────");
  console.log("");
  console.log("Uso:");
  console.log("  npx tsx scripts/create-admin.ts <email> <nombre> <contraseña>");
  console.log("");
  console.log("Ejemplo:");
  console.log('  npx tsx scripts/create-admin.ts admin@empresa.com "Juan Admin" MiContraseña123');
  console.log("");
  process.exit(1);
}

const [email, name, password] = args;

// Validaciones básicas
if (!email.includes("@")) {
  console.error("❌ Email inválido:", email);
  process.exit(1);
}
if (password.length < 8) {
  console.error("❌ La contraseña debe tener mínimo 8 caracteres");
  process.exit(1);
}

async function createAdmin() {
  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("");
  console.log("🔧 Creando administrador...");
  console.log(`   Email: ${email}`);
  console.log(`   Nombre: ${name}`);
  console.log("");

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirmar (sin necesidad de verificar email)
    app_metadata: { role: "admin" },
    user_metadata: { full_name: name },
  });

  if (error) {
    if (error.message.includes("already been registered")) {
      console.error("❌ Este email ya está registrado");
    } else {
      console.error("❌ Error:", error.message);
    }
    process.exit(1);
  }

  console.log("✅ Administrador creado exitosamente");
  console.log(`   ID: ${data.user.id}`);
  console.log(`   Email: ${data.user.email}`);
  console.log("");
  console.log("🔑 Ya puede iniciar sesión en el dashboard.");
  console.log("");
}

createAdmin();
