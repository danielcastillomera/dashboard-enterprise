"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

/* ============================================
   useRealtimeNotifications HOOK
   
   Suscribe a Supabase Realtime para recibir
   notificaciones en tiempo real.
   
   Flujo:
   1. Carga notificaciones existentes via REST
   2. Se suscribe a INSERTs via Realtime
   3. Actualiza el estado en tiempo real
   ============================================ */

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "warning" | "info" | "success" | "order" | "error";
  read: boolean;
  href: string | null;
  tenant_id: string;
  created_at: string;
}

interface UseRealtimeNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismiss: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export function useRealtimeNotifications(): UseRealtimeNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabaseRef = useRef<SupabaseClient | null>(null);

  // Safe Supabase client getter
  const getSupabase = useCallback((): SupabaseClient | null => {
    if (supabaseRef.current) return supabaseRef.current;
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) return null;
      supabaseRef.current = createClient();
      return supabaseRef.current;
    } catch {
      return null;
    }
  }, []);

  // Cargar notificaciones existentes
  const loadNotifications = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.warn("Error cargando notificaciones:", error.message);
        return;
      }

      setNotifications(data || []);
    } catch (err) {
      console.warn("Error de conexión:", err);
    } finally {
      setIsLoading(false);
    }
  }, [getSupabase]);

  // Suscribirse a Realtime
  useEffect(() => {
    loadNotifications();

    const supabase = getSupabase();
    if (!supabase) return;

    let channel: RealtimeChannel | null = null;

    try {
      channel = supabase
        .channel("notifications-realtime")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
          },
          (payload) => {
            const newNotif = payload.new as Notification;
            setNotifications((prev) => [newNotif, ...prev]);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
          },
          (payload) => {
            const updated = payload.new as Notification;
            setNotifications((prev) =>
              prev.map((n) => (n.id === updated.id ? updated : n))
            );
          }
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "notifications",
          },
          (payload) => {
            const deleted = payload.old as { id: string };
            setNotifications((prev) =>
              prev.filter((n) => n.id !== deleted.id)
            );
          }
        )
        .subscribe();
    } catch (err) {
      console.warn("Realtime no disponible:", err);
    }

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadNotifications, getSupabase]);

  // Marcar como leída
  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    if (error) {
      console.warn("Error marcando notificación:", error.message);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n))
      );
    }
  }, [getSupabase]);

  // Marcar todas como leídas
  const markAllRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", unreadIds);

    if (error) {
      console.warn("Error marcando todas:", error.message);
      loadNotifications();
    }
  }, [notifications, loadNotifications, getSupabase]);

  // Eliminar notificación
  const dismiss = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      console.warn("Error eliminando:", error.message);
      loadNotifications();
    }
  }, [loadNotifications, getSupabase]);

  // Limpiar todas
  const clearAll = useCallback(async () => {
    const allIds = notifications.map((n) => n.id);
    if (allIds.length === 0) return;

    setNotifications([]);

    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase
      .from("notifications")
      .delete()
      .in("id", allIds);

    if (error) {
      console.warn("Error limpiando:", error.message);
      loadNotifications();
    }
  }, [notifications, loadNotifications, getSupabase]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllRead,
    dismiss,
    clearAll,
  };
}
