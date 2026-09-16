"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { TaskResponse, TaskStats } from "@/lib/task-utils";

export interface TaskFilters {
  status: string; // all | pending | completed
  priority: string; // all | low | medium | high
  category: string; // all | <specific>
  search: string;
  sort: "due" | "priority" | "created" | "manual";
  sortDir: "asc" | "desc";
}

export const DEFAULT_FILTERS: TaskFilters = {
  status: "all",
  priority: "all",
  category: "all",
  search: "",
  sort: "due",
  sortDir: "asc",
};

const STORAGE_KEY = "studydesk:filters:v1";
const MANUAL_ORDER_KEY = "studydesk:manual-order";

function buildQuery(filters: TaskFilters): string {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all")
    params.set("status", filters.status);
  if (filters.priority && filters.priority !== "all")
    params.set("priority", filters.priority);
  if (filters.category && filters.category !== "all")
    params.set("category", filters.category);
  if (filters.search.trim()) params.set("search", filters.search.trim());
  // For manual sort, fetch by created date (client reorders via localStorage)
  params.set("sort", filters.sort === "manual" ? "created" : filters.sort);
  params.set("dir", filters.sort === "manual" ? "desc" : filters.sortDir);
  return params.toString();
}

/** Load manual task order from localStorage. Returns map of taskId → index. */
export function loadManualOrder(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(MANUAL_ORDER_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** Save manual task order to localStorage. */
export function saveManualOrder(order: Record<string, number>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MANUAL_ORDER_KEY, JSON.stringify(order));
  } catch {
    // ignore
  }
}

function loadPersistedFilters(): TaskFilters {
  if (typeof window === "undefined") return DEFAULT_FILTERS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FILTERS;
    const parsed = JSON.parse(raw);
    // Merge to ensure new fields default properly
    return {
      ...DEFAULT_FILTERS,
      ...parsed,
      sort: ["due", "priority", "created", "manual"].includes(parsed.sort)
        ? parsed.sort
        : "due",
      sortDir: parsed.sortDir === "asc" || parsed.sortDir === "desc" ? parsed.sortDir : "asc",
    };
  } catch {
    return DEFAULT_FILTERS;
  }
}

export function useTasks(filters: TaskFilters) {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = buildQuery(filters);
      const res = await fetch(`/api/tasks?${q}`, { cache: "no-store" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load tasks");
      }
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Persist filters to localStorage (skip transient search while typing? keep simple - persist all)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch {
      // ignore quota errors
    }
  }, [filters]);

  return { tasks, setTasks, loading, error, refetch };
}

export function useStats() {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load stats");
      }
      const data = await res.json();
      setStats(data.stats || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { stats, loading, error, refetch };
}

/** Hook returning initial filters hydrated from localStorage (avoids SSR mismatch). */
export function useHydratedFilters() {
  // useSyncExternalStore guarantees SSR-safe reading of browser-only state.
  // We subscribe to a no-op subscription because the persisted filters are read once on mount.
  const subscribe = useCallback((cb: () => void) => {
    window.addEventListener("storage", cb);
    return () => window.removeEventListener("storage", cb);
  }, []);
  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) ?? "";
    } catch {
      return "";
    }
  }, []);
  const getServerSnapshot = useCallback(() => "", []);

  // Trigger subscription so React re-renders if storage changes cross-tab.
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters(loadPersistedFilters());
    setHydrated(true);
  }, []);

  return { filters, setFilters, hydrated };
}
