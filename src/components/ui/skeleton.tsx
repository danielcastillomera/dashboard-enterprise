"use client";

/* ============================================
   SKELETON LOADING — ENTERPRISE
   Estándar: Stripe, Shopify, Linear
   
   Animación pulse para estados de carga.
   ============================================ */

export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[var(--color-dashboard-border)] ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--color-dashboard-border)] bg-[var(--color-dashboard-surface)] p-5">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="h-64 flex items-end gap-2 p-4">
      {[40, 65, 50, 80, 55, 70].map((h, i) => (
        <Skeleton key={i} className="flex-1" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Cargando contenido">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[var(--color-dashboard-border)] bg-[var(--color-dashboard-surface)] p-5">
          <Skeleton className="h-5 w-40 mb-4" />
          <ChartSkeleton />
        </div>
        <div className="rounded-2xl border border-[var(--color-dashboard-border)] bg-[var(--color-dashboard-surface)] p-5">
          <Skeleton className="h-5 w-40 mb-4" />
          <ChartSkeleton />
        </div>
      </div>
      <span className="sr-only">Cargando...</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center" role="alert">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">Error al cargar datos</p>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-600)] transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
