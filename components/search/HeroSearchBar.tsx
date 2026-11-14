"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Icon } from "@/components/common/Icon";
import { schoolNames } from "@/lib/labels";

type Suggestion = {
  id: string;
  nameEn: string;
  nameMn: string | null;
  district: string | null;
  aimagCity: string;
};

/**
 * Homepage search with live suggestions: typing two or more characters
 * shows matching schools you can jump straight to, and Enter (with nothing
 * highlighted) opens the full results page.
 */
export function HeroSearchBar() {
  const t = useTranslations("HeroSearch");
  const tPlace = useTranslations("Place");
  const locale = useLocale();
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsFor, setSuggestionsFor] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const trimmed = query.trim();
  const showList = isOpen && trimmed.length >= 2 && suggestionsFor !== "";

  useEffect(() => {
    if (trimmed.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/schools?limit=6&q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data: { schools: Suggestion[] } = await res.json();
        setSuggestions(data.schools);
        setSuggestionsFor(trimmed);
        setActiveIndex(-1);
      } catch {
        // Superseded by a newer keystroke, or offline — plain search still works.
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  function goToResults() {
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const picked = showList ? suggestions[activeIndex] : undefined;
    if (picked) router.push(`/school/${picked.id}`);
    else goToResults();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!showList || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    }
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="relative w-full text-left">
      <div className="flex items-center gap-2 rounded-2xl border-2 border-foreground bg-surface p-1.5 transition-shadow focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_28%,transparent)]">
        <Icon name="search" className="ml-2.5 size-5 shrink-0 text-foreground" />
        <input
          type="text"
          role="combobox"
          aria-label={t("ariaLabel")}
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          onKeyDown={handleKeyDown}
          placeholder={t("placeholder")}
          className="min-h-11 min-w-0 flex-1 bg-transparent px-1 text-base text-foreground outline-none placeholder:text-subtle"
        />
        <button
          type="submit"
          className="btn-primary shrink-0 sm:px-6"
        >
          {t("search")}
        </button>
      </div>

      {showList && (
        // preventDefault keeps focus in the input, so clicking a suggestion
        // isn't cancelled by the input's blur closing the list first.
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="pop-in absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-pop)]"
        >
          <ul id={listId} role="listbox" aria-label={t("matching")} className="py-1.5">
            {suggestions.map((school, i) => {
              const { primary, secondary } = schoolNames(school, locale);
              const place = school.district ?? school.aimagCity;
              return (
              <li
                key={school.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === activeIndex}
              >
                <Link
                  href={`/school/${school.id}`}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex min-h-12 items-center justify-between gap-4 px-4 py-2 ${
                    i === activeIndex ? "bg-surface-muted" : ""
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {primary}
                    </span>
                    {secondary && (
                      <span className="block truncate text-xs text-muted">{secondary}</span>
                    )}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-subtle">
                    <Icon name="map-pin" className="size-3.5" />
                    {tPlace.has(place) ? tPlace(place) : place}
                  </span>
                </Link>
              </li>
              );
            })}
          </ul>
          {suggestions.length === 0 && (
            <p className="px-4 pb-1 pt-2 text-sm text-muted">
              {t("noMatch", { query: suggestionsFor })}
            </p>
          )}
          <button
            type="button"
            onClick={goToResults}
            className="flex min-h-12 w-full items-center gap-2 border-t border-line px-4 text-sm font-semibold text-accent transition-colors hover:bg-surface-muted"
          >
            {t("seeAll", { query: trimmed })}
            <Icon name="arrow-right" className="size-4" />
          </button>
        </div>
      )}
    </form>
  );
}
