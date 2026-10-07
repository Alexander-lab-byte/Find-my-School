"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/common/Icon";
import { useSearchNavigation } from "@/components/search/SearchNavigation";
import { SORT_KEYS, type SortKey } from "@/lib/labels";

/** Search box that updates results as you type (debounced) — no button press needed. */
export function SearchInput() {
  const t = useTranslations("Search");
  const { searchParams, update } = useSearchNavigation();
  const urlQuery = searchParams.get("q") ?? "";

  const [value, setValue] = useState(urlQuery);
  const [lastSent, setLastSent] = useState(urlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);

  // Follow URL changes made elsewhere (back button, "clear" links), but not
  // the echo of our own update — that would clobber what's being typed.
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    if (urlQuery !== lastSent) {
      setValue(urlQuery);
      setLastSent(urlQuery);
    }
  }

  useEffect(() => {
    const next = value.trim();
    if (next === urlQuery || next === lastSent) return;
    const timer = setTimeout(() => {
      setLastSent(next);
      update({ q: next || null }, { replace: true });
    }, 350);
    return () => clearTimeout(timer);
  }, [value, urlQuery, lastSent, update]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = value.trim();
    setLastSent(next);
    update({ q: next || null });
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="relative">
      <Icon
        name="search"
        className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-subtle"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("inputPlaceholder")}
        aria-label={t("inputLabel")}
        autoComplete="off"
        className="field h-12 rounded-xl pl-12 pr-11 text-base [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label={t("clear")}
          className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-subtle transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <Icon name="x" className="size-4" />
        </button>
      )}
    </form>
  );
}

export function SortSelect({ value }: { value: SortKey }) {
  const t = useTranslations("Search");
  const tSort = useTranslations("Sort");
  const { update } = useSearchNavigation();

  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      <span className="whitespace-nowrap">{t("sortBy")}</span>
      <select
        value={value}
        onChange={(e) => update({ sort: e.target.value === "rating" ? null : e.target.value })}
        className="field w-auto cursor-pointer py-2 pr-8 font-medium"
      >
        {SORT_KEYS.map((key) => (
          <option key={key} value={key}>
            {tSort(key)}
          </option>
        ))}
      </select>
    </label>
  );
}
