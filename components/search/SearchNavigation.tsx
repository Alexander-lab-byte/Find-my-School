"use client";

import { createContext, useCallback, useContext, useTransition } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
  type ReadonlyURLSearchParams,
} from "next/navigation";

type Changes = Record<string, string | null>;

type SearchNavigation = {
  searchParams: ReadonlyURLSearchParams;
  isPending: boolean;
  update: (changes: Changes, options?: { replace?: boolean }) => void;
};

const SearchNavigationContext = createContext<SearchNavigation | null>(null);

/**
 * Owns the search page's URL state. Filters, sort, and the search box all
 * write through `update`, inside one transition — so the results area can
 * dim while the server renders the next page, instead of feeling frozen.
 */
export function SearchNavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const update = useCallback(
    (changes: Changes, { replace = false }: { replace?: boolean } = {}) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      // Any change to what's being searched starts back at page 1.
      if (!("page" in changes)) params.delete("page");

      const qs = params.toString();
      const href = qs ? `${pathname}?${qs}` : pathname;
      startTransition(() => {
        if (replace) router.replace(href, { scroll: false });
        else router.push(href, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  return (
    <SearchNavigationContext.Provider value={{ searchParams, isPending, update }}>
      {children}
    </SearchNavigationContext.Provider>
  );
}

export function useSearchNavigation() {
  const context = useContext(SearchNavigationContext);
  if (!context) throw new Error("useSearchNavigation must be used inside SearchNavigationProvider");
  return context;
}

/** Fades its (server-rendered) children while a search update is in flight. */
export function PendingArea({ children }: { children: React.ReactNode }) {
  const { isPending } = useSearchNavigation();
  return (
    <div
      aria-busy={isPending}
      className={`transition-opacity duration-200 ${isPending ? "pointer-events-none opacity-50" : ""}`}
    >
      {children}
    </div>
  );
}
