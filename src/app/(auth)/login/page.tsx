"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";
import { validateLoginForm } from "@/lib/validations/auth";

/* ============================================
   LOGIN PAGE — ENTERPRISE STANDARD
   Patrón: Stripe, Shopify Admin, AWS Console
   
   - Solo email + password + "Iniciar sesión"
   - Sin registro público (invite-only)
   - Sin password strength (solo en creación)
   - Link "¿Olvidaste tu contraseña?"
   ============================================ */

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validation = validateLoginForm(email, password);
    if (validation.length > 0) {
      setError(validation[0]);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await loginAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/panel");
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Brand */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
          F
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Iniciar sesión
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Ingresa tus credenciales de administrador
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@empresa.com"
              autoComplete="email"
              required
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-shadow"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <a
              href="/recuperar-password"
              className="text-xs text-amber-600 hover:text-amber-700 font-medium"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-shadow"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Iniciando sesión...
            </span>
          ) : (
            "Iniciar sesión"
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 mt-8">
        Acceso exclusivo para administradores del sistema.
        <br />
        Contacte al administrador principal para obtener credenciales.
      </p>
    </div>
  );
}
