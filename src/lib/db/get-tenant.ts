import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/* ============================================
   GET TENANT — SESSION-BASED
   
   Obtiene el tenantId del usuario autenticado.
   Flujo: Supabase Auth → Profile → tenantId
   
   Usado por: API Routes y Server Actions
   ============================================ */

export async function getCurrentTenantId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  // Buscar perfil del usuario para obtener su tenant
  const profile = await prisma.profile.findFirst({
    where: {
      OR: [
        { id: user.id },
        { email: user.email! },
      ],
    },
    select: { tenantId: true },
  });

  if (!profile) {
    // Fallback: si no hay perfil, buscar el primer tenant (setup inicial)
    const tenant = await prisma.tenant.findFirst({
      select: { id: true },
    });
    if (tenant) {
      return tenant.id;
    }
    throw new Error("No se encontró perfil ni tenant para el usuario");
  }

  return profile.tenantId;
}

/** Obtener el usuario autenticado actual */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await prisma.profile.findFirst({
    where: {
      OR: [
        { id: user.id },
        { email: user.email! },
      ],
    },
    include: { tenant: true },
  });

  return profile
    ? { ...profile, authUser: user }
    : null;
}
