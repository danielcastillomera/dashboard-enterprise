"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: "light" as const, icon: Sun, label: "Tema claro" },
    { value: "dark" as const, icon: Moon, label: "Tema oscuro" },
    { value: "system" as const, icon: Monitor, label: "Tema del sistema" },
  ];

  return (
    <div
      className="flex items-center rounded-lg border border-[var(--color-dashboard-border)] bg-[var(--color-dashboard-surface)] p-0.5"
      role="radiogroup"
      aria-label="Seleccionar tema"
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          title={label}
          className={`p-1.5 rounded-md transition-colors duration-200 ${
            theme === value
              ? "bg-[var(--color-brand-500)] text-[var(--color-dashboard-bg)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}
