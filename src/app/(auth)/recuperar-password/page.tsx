"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, Mail, ArrowLeft } from "lucide-react";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { forgotPasswordAction } from "@/lib/actions/auth";

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function validate(value: string) {
    const result = forgotPasswordSchema.safeParse({ email: value });
    if (!result.success) {
      setError(result.error.issues[0].message);
    } else {
      setError("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage("");

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0].message);
      setTouched(true);
      return;
    }

    startTransition(async () => {
      const res = await forgotPasswordAction({ email });
      if (res?.error) setError(res.error);
      if (res?.success) setSuccessMessage(res.success);
    });
  }

  // Éxito: mostrar confirmación
  if (successMessage) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
          <Mail size={32} className="text-amber-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Correo enviado</h1>
        <p className="text-sm text-gray-500 mb-6">{successMessage}</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Volver al login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Recuperar Contraseña
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Ingresá tu correo y te enviaremos un enlace para restablecerla
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Correo Electrónico
          </label>
          <input
            id="email" type="email" autoComplete="email" placeholder="tu@empresa.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (touched) validate(e.target.value);
            }}
            onBlur={() => { setTouched(true); validate(email); }}
            aria-invalid={touched && error ? "true" : undefined}
            className={`w-full px-4 py-3 rounded-lg border text-gray-900 text-sm placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors
              ${touched && error ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-amber-400 focus:border-amber-400"}`}
          />
          {touched && error && (
            <p role="alert" className="flex items-center gap-1 mt-1.5 text-xs text-red-600">
              <AlertCircle size={12} />{error}
            </p>
          )}
        </div>

        <button
          type="submit" disabled={isPending}
          className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold
            focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
            disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200
            flex items-center justify-center gap-2"
        >
          {isPending ? (
            <><Loader2 size={18} className="animate-spin" /> Enviando...</>
          ) : (
            "Enviar enlace de recuperación"
          )}
        </button>
      </form>

      <p className="text-center mt-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={14} /> Volver al login
        </Link>
      </p>
    </div>
  );
}
