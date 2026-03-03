/* ============================================
   PHASE 13 — TENANT CONFIG ADDITIONS
   
   Add these modules to your ALL_MODULES array
   in src/lib/tenant-config.ts
   ============================================ */

// ADD these after existing modules in ALL_MODULES:
//
//   { id: "clientes", name: "Clientes", enabled: true, icon: "Users", path: "/store/clients" },
//   { id: "facturacion", name: "Facturación", enabled: true, icon: "FileText", path: "/store/billing" },
//   { id: "configuracion", name: "Configuración", enabled: true, icon: "Settings", path: "/store/settings" },

// ADD these icons to the iconMap in sidebar.tsx:
//
//   import { ..., Users, FileText, Settings, Receipt } from "lucide-react";
//
//   const iconMap = {
//     ...existing,
//     Users,
//     FileText,
//     Settings,
//     Receipt,
//   };
