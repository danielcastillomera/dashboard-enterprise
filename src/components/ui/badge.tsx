type BadgeVariant = "success" | "warning" | "error" | "info" | "default";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-emerald-500/15 text-emerald-500",
  warning: "bg-amber-500/15 text-amber-500",
  error: "bg-red-500/15 text-red-500",
  info: "bg-blue-500/15 text-blue-500",
  default: "bg-[var(--color-dashboard-surface-hover)] text-[var(--color-text-secondary)]",
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5
        rounded-[var(--radius-badge)]
        text-xs font-semibold
        ${variantClasses[variant]}
      `}
    >
      {children}
    </span>
  );
}
