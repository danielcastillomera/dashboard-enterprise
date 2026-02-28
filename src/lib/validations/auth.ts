import { z } from "zod";

/* ============================================
   VALIDACIONES DE AUTENTICACIÓN — ENTERPRISE
   
   Patrón invite-only (Stripe/Shopify):
   - Login: validación simple
   - Registro: NO EXISTE (admin crea usuarios)
   - Reset password: validación con fortaleza
   ============================================ */

export const emailSchema = z
  .string()
  .min(1, "El correo electrónico es obligatorio")
  .email("Ingresa un correo electrónico válido");

export const passwordSchema = z
  .string()
  .min(1, "La contraseña es obligatoria")
  .min(8, "La contraseña debe tener mínimo 8 caracteres");

// Login — validación mínima
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "La contraseña es obligatoria"),
});

// Recuperar contraseña
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset / establecer nueva contraseña (para invites y recuperación)
export const resetPasswordSchema = z
  .object({
    password: passwordSchema
      .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
      .regex(/[0-9]/, "Debe incluir al menos un número"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// Tipos
export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/* ============================================
   VALIDACIÓN SIMPLE PARA LOGIN
   (sin Zod para respuesta rápida en UI)
   ============================================ */
export function validateLoginForm(email: string, password: string): string[] {
  const errors: string[] = [];
  if (!email) errors.push("El correo electrónico es obligatorio");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Ingresa un correo válido");
  if (!password) errors.push("La contraseña es obligatoria");
  return errors;
}

/* ============================================
   PASSWORD STRENGTH — solo para creación/reset
   ============================================ */
export interface PasswordStrength {
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { level: 0, label: "", color: "#64748B" };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;

  if (score <= 1) return { level: 1, label: "Débil", color: "#EF4444" };
  if (score <= 2) return { level: 2, label: "Regular", color: "#F59E0B" };
  if (score <= 3) return { level: 3, label: "Buena", color: "#3B82F6" };
  return { level: 4, label: "Fuerte", color: "#10B981" };
}
