import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Dashboard Enterprise",
    template: "%s | Dashboard Enterprise",
  },
  description: "Sistema de gestión empresarial multi-industria. Control de ventas, inventario, compras y pedidos.",
  robots: { index: false, follow: false },
  authors: [{ name: "Daniel Fernando Castillo Mera" }],
  creator: "Daniel Fernando Castillo Mera",
  other: {
    "copyright": "© 2024-2026 Daniel Fernando Castillo Mera. All Rights Reserved.",
    "X-UA-Compatible": "IE=edge",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
