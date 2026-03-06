/* ============================================
   RESEND CLIENT
   
   Inicialización del cliente de Resend para
   el envío de correos transaccionales.
   ============================================ */

import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("⚠️  RESEND_API_KEY no está configurado. Los correos no se enviarán.");
}

export const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

export const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";
