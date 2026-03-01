/* ============================================
   SINCRONIZAR PERFIL — CLI
   
   Vincula un usuario existente de Supabase Auth
   con su perfil en la base de datos.
   
   Necesario cuando:
   - Se creó el usuario en Auth ANTES del seed
   - El profile.id no coincide con el auth.uid
   
   Uso:
   npx tsx scripts/sync-profile.ts edgar@ferreteria.com
   ============================================ */

import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Variables requeridas: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.log("");
  console.log("📋 Sincronizar perfil con Supabase Auth");
  console.log("────────────────────────────────────────");
  console.log("");
  console.log("Uso:  npx tsx scripts/sync-profile.ts <email>");
  console.log("Ej:   npx tsx scripts/sync-profile.ts edgar@ferreteria.com");
  console.log("");
  process.exit(1);
}

async function syncProfile() {
  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const prisma = new PrismaClient();

  try {
    console.log("");
    console.log(`🔍 Buscando usuario: ${email}`);

    // 1. Buscar en Supabase Auth
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;

    const authUser = users.find((u) => u.email === email);
    if (!authUser) {
      console.error(`❌ No existe usuario con email ${email} en Supabase Auth`);
      process.exit(1);
    }
    console.log(`✅ Auth user encontrado: ${authUser.id}`);

    // 2. Buscar perfil en la BD
    const profile = await prisma.profile.findUnique({ where: { email } });
    if (!profile) {
      // Crear perfil nuevo vinculado al tenant existente
      const tenant = await prisma.tenant.findFirst();
      if (!tenant) {
        console.error("❌ No hay tenant en la base de datos. Ejecutá primero: npx prisma db seed");
        process.exit(1);
      }

      const newProfile = await prisma.profile.create({
        data: {
          id: authUser.id,
          email,
          name: authUser.user_metadata?.full_name || email.split("@")[0],
          role: "admin",
          tenantId: tenant.id,
        },
      });
      console.log(`✅ Perfil creado: ${newProfile.id} → tenant ${tenant.id}`);
    } else if (profile.id !== authUser.id) {
      // Actualizar el ID del perfil para que coincida con Auth
      await prisma.profile.update({
        where: { email },
        data: { id: authUser.id },
      });
      console.log(`✅ Perfil actualizado: ${profile.id} → ${authUser.id}`);
      console.log(`   Tenant: ${profile.tenantId}`);
    } else {
      console.log(`✅ Perfil ya sincronizado: ${profile.id}`);
    }

    console.log("");
    console.log("🎉 Sincronización completa. El usuario puede iniciar sesión.");
    console.log("");
  } finally {
    await prisma.$disconnect();
  }
}

syncProfile();
