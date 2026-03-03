"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ============================================
   useData HOOK — ENTERPRISE DATA FETCHER
   Estándar: SWR-like pattern (Vercel)
   
   Funcionalidades:
   - Fetch automático al montar
   - Revalidación manual (mutate)
   - Loading/error states
   - Cache básico por URL
   - Toast integration para mutaciones
   ============================================ */

interface UseDataReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  mutate: () => Promise<void>;
}

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30_000; // 30 seconds

export function useData<T>(url: string, params?: Record<string, string>): UseDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fullUrl = params
    ? `${url}?${new URLSearchParams(params).toString()}`
    : url;

  const fetchData = useCallback(async () => {
    // Check cache first
    const cached = cache.get(fullUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setData(cached.data as T);
      setIsLoading(false);
      return;
    }

    // Abort previous request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(fullUrl, { signal: abortRef.current.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      
      // Update cache
      cache.set(fullUrl, { data: json, timestamp: Date.now() });
      setData(json);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [fullUrl]);

  useEffect(() => {
    fetchData();
    return () => { abortRef.current?.abort(); };
  }, [fetchData]);

  const mutate = useCallback(async () => {
    cache.delete(fullUrl);
    await fetchData();
  }, [fullUrl, fetchData]);

  return { data, isLoading, error, mutate };
}

/** Invalidar cache de un endpoint específico */
export function invalidateCache(urlPrefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(urlPrefix)) cache.delete(key);
  }
}

/** Invalidar todo el cache */
export function clearAllCache() {
  cache.clear();
}
