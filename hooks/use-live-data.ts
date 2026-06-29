"use client";

import { useEffect, useRef, useState } from "react";

type PollOptions = {
  intervalMs?: number;
  enabled?: boolean;
  stopWhen?: (data: unknown) => boolean;
};

export function usePollingResource<T>(url: string, initialData: T, options: PollOptions = {}) {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const stopped = useRef(false);

  async function refresh() {
    if (stopped.current) return;
    try {
      setError(null);
      const response = await fetch(url, { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? `Unable to load ${url}`);
      setData(json as T);
      if (options.stopWhen?.(json)) stopped.current = true;
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : `Unable to load ${url}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    stopped.current = false;
    if (options.enabled === false) return;
    void refresh();
    const id = window.setInterval(() => void refresh(), options.intervalMs ?? 2500);
    return () => window.clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, options.enabled, options.intervalMs]);

  return { data, loading, error, refresh };
}

export function useLiveRun(runId?: string | null) {
  return usePollingResource<{ run: { status?: string } | null }>(runId ? `/api/runs/${runId}` : "/api/runs/latest", { run: null }, { enabled: true, stopWhen: (data) => {
    const status = (data as { run?: { status?: string } }).run?.status;
    return status === "complete" || status === "failed";
  } });
}

export function useOrders() {
  return usePollingResource<{ orders: unknown[] }>("/api/orders", { orders: [] });
}

export function useReceipts() {
  return usePollingResource<{ receipts: unknown[] }>("/api/receipts", { receipts: [] });
}

export function usePnl() {
  return usePollingResource<{ pnl: unknown }>("/api/pnl", { pnl: null });
}
