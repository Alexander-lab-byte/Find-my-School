"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Icon } from "@/components/common/Icon";

type Suggestion = {
  id: string;
  nameEn: string;
  nameMn: string;
  district: string | null;
  aimagCity: string;
};

/**
 * Homepage search with live suggestions: typing two or more characters
 * shows matching schools you can jump straight to, and Enter (with nothing
 * highlighted) opens the full results page.
 */
export function HeroSearchBar() {
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
    <form role="search" onSubmit={handleSubmit} className="relative w-full max-w-2xl text-left">
      <div className="flex items-center gap-2 rounded-xl border border-line-strong bg-surface p-2 shadow-[0_16px_40px_-24px_rgb(0_0_0/0.35)] transition focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/15">
        <Icon name="search" className="ml-2 size-5 shrink-0 text-subtle" />
        <input
          type="text"
          role="combobox"
          aria-label="Search schools"
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
          placeholder="Name, number, or district…"
          className="min-w-0 flex-1 bg-transparent px-1 py-2 text-base text-foreground outline-none placeholder:text-subtle"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover sm:px-6"
        >
          Search
        </button>
      </div>

      {showList && (
        // preventDefault keeps focus in the input, so clicking a suggestion
        // isn't cancelled by the input's blur closing the list first.
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_20px_40px_-20px_rgb(0_0_0/0.3)]"
        >
          <ul id={listId} role="listbox" aria-label="Matching schools" className="py-1.5">
            {suggestions.map((school, i) => (
              <li
                key={school.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === activeIndex}
              >
                <Link
                  href={`/school/${school.id}`}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex items-center justify-between gap-4 px-4 py-2.5 ${
                    i === activeIndex ? "bg-surface-muted" : ""
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {school.nameEn}
                    </span>
                    <span className="block truncate text-xs text-muted">{school.nameMn}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-subtle">
                    <Icon name="map-pin" className="size-3.5" />
                    {school.district ?? school.aimagCity}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {suggestions.length === 0 && (
            <p className="px-4 pb-1 pt-2 text-sm text-muted">
              No schools match “{suggestionsFor}” yet.
            </p>
          )}
          <button
            type="button"
            onClick={goToResults}
            className="flex w-full items-center gap-2 border-t border-line px-4 py-3 text-sm font-medium text-accent transition-colors hover:bg-surface-muted"
          >
            See all results for “{trimmed}”
            <Icon name="arrow-right" className="size-4" />
          </button>
        </div>
      )}
    </form>
  );
}
