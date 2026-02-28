import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-dashboard-bg)] px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-[var(--color-brand-500)] mb-4">404</p>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
          Página no encontrada
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          La página que buscas no existe o fue movida.
        </p>
        <Link
          href="/panel"
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[var(--color-brand-500)] text-white text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)] focus-visible:ring-offset-2"
        >
          Volver al Panel
        </Link>
      </div>
    </div>
  );
}
