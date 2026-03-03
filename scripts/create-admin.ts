/* ============================================
   CREAR USUARIO ADMINISTRADOR — CLI
   Patrón enterprise (Stripe/Shopify/AWS):
   Los admins se crean por línea de comando,
   nunca por registro público.
   
   Crea el usuario en Supabase Auth Y su perfil
   en la tabla profiles vinculado al tenant.
   
   Uso:
   npx tsx scripts/create-admin.ts admin@empresa.com "Mi Nombre" contraseña123
   ============================================ */

import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

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
  const prisma = new PrismaClient();

  try {
    console.log("");
    console.log("🔧 Creando administrador...");
    console.log(`   Email: ${email}`);
    console.log(`   Nombre: ${name}`);
    console.log("");

    // 1. Crear usuario en Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: "admin" },
      user_metadata: { full_name: name },
    });

    if (error) {
      if (error.message.includes("already been registered")) {
        console.error("❌ Este email ya está registrado en Auth");
      } else {
        console.error("❌ Error Auth:", error.message);
      }
      process.exit(1);
    }

    console.log(`✅ Auth user creado: ${data.user.id}`);

    // 2. Buscar o crear tenant
    let tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: "Mi Tienda",
          industry: "general",
          currency: "USD",
        },
      });
      console.log(`✅ Tenant creado: ${tenant.name}`);
    } else {
      console.log(`✅ Tenant existente: ${tenant.name}`);
    }

    // 3. Crear perfil en la base de datos (vinculado al auth user y al tenant)
    const profile = await prisma.profile.upsert({
      where: { email },
      update: {
        id: data.user.id, // Sincronizar ID con Supabase Auth
        name,
        role: "admin",
      },
      create: {
        id: data.user.id,
        email,
        name,
        role: "admin",
        tenantId: tenant.id,
      },
    });

    console.log(`✅ Perfil vinculado: ${profile.id} → tenant ${tenant.id}`);
    console.log("");
    console.log("🎉 Administrador listo. Ya puede iniciar sesión.");
    console.log("");
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
