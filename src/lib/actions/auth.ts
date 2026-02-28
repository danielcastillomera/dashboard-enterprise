"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations/auth";

/* ============================================
   AUTH SERVER ACTIONS — ENTERPRISE
   Patrón: invite-only (sin registro público)
   ============================================ */

export interface AuthResult {
  error?: string;
  success?: string;
}

// ---- LOGIN ----
export async function loginAction(formData: FormData): Promise<AuthResult> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Mensaje genérico de seguridad (no revelar si el email existe)
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Credenciales incorrectas" };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Cuenta pendiente de confirmación. Contacte al administrador" };
    }
    if (error.message.includes("Too many requests")) {
      return { error: "Demasiados intentos. Espere unos minutos" };
    }
    return { error: "Error al iniciar sesión. Intente de nuevo" };
  }

  redirect("/panel");
}

// ---- LOGOUT ----
export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ---- RECUPERAR CONTRASEÑA ----
export async function forgotPasswordAction(
  formData: ForgotPasswordFormData
): Promise<AuthResult> {
  const parsed = forgotPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
    }
  );

  if (error) {
    return { error: "Error al enviar el correo. Intente de nuevo" };
  }

  // Siempre devolver éxito (seguridad: no revelar si el email existe)
  return {
    success: "Si el correo está registrado, recibirá un enlace para restablecer su contraseña",
  };
}
