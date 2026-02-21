import { redirect } from "next/navigation";

/* ============================================
   REGISTRO — DESHABILITADO
   Patrón enterprise: invite-only
   Los admins se crean via CLI o Supabase Admin API
   ============================================ */
export default function RegistroPage() {
  redirect("/login");
}
