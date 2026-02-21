"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

/* ============================================
   DASHBOARD LAYOUT — ENTERPRISE + WCAG 2.2
   
   Accesibilidad:
   - Skip to content link (WCAG 2.4.1)
   - Landmarks: banner, navigation, main
   - Proper focus management
   ============================================ */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-dashboard-bg)]">
      {/* Skip to content — WCAG 2.4.1 Nivel A */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--color-brand-500)] focus:text-white focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        Ir al contenido principal
      </a>

      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Contenido principal */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 md:p-6"
          role="main"
          aria-label="Contenido principal del dashboard"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
