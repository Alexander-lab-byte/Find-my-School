"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { MAX_COMPARE } from "@/lib/compare";

export { MAX_COMPARE };

const STORAGE_KEY = "compare-school-ids";
const CHANGE_EVENT = "compare-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function getServerSnapshot() {
  return "[]";
}

function parse(raw: string): string[] {
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter((x): x is string => typeof x === "string").slice(0, MAX_COMPARE);
  } catch {
    return [];
  }
}

function save(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage unavailable (private mode): the change still applies for this page view.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useCompare() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ids = useMemo(() => parse(raw), [raw]);

  const toggle = useCallback((id: string) => {
    const current = parse(getSnapshot());
    if (current.includes(id)) save(current.filter((x) => x !== id));
    else if (current.length < MAX_COMPARE) save([...current, id]);
  }, []);

  const remove = useCallback((id: string) => {
    save(parse(getSnapshot()).filter((x) => x !== id));
  }, []);

  const clear = useCallback(() => save([]), []);

  return {
    ids,
    isFull: ids.length >= MAX_COMPARE,
    has: (id: string) => ids.includes(id),
    toggle,
    remove,
    clear,
  };
}
