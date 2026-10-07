"use client";

import type { Curriculum, SchoolLevel, SchoolType } from "@prisma/client";
import { Icon } from "@/components/common/Icon";
import { FILTER_KEYS } from "@/components/search/FilterBar";
import { useSearchNavigation } from "@/components/search/SearchNavigation";
import { CURRICULUM_LABELS, LEVEL_LABELS, TYPE_LABELS } from "@/lib/labels";

function labelFor(key: (typeof FILTER_KEYS)[number], value: string) {
  switch (key) {
    case "type":
      return TYPE_LABELS[value as SchoolType] ?? value;
    case "level":
      return LEVEL_LABELS[value as SchoolLevel] ?? value;
    case "curriculum":
      return CURRICULUM_LABELS[value as Curriculum] ?? value;
    case "dorm":
      return "Has dormitory";
    default:
      return value;
  }
}

/** Removable pills summarising the filters currently applied. */
export function ActiveFilters() {
  const { searchParams, update } = useSearchNavigation();

  const active = FILTER_KEYS.flatMap((key) => {
    const value = searchParams.get(key);
    return value ? [{ key, value }] : [];
  });

  if (active.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Active filters">
      {active.map(({ key, value }) => (
        <li key={key}>
          <button
            type="button"
            onClick={() => update({ [key]: null })}
            className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft py-1 pl-3 pr-2 text-xs font-medium text-accent transition-colors hover:border-accent"
          >
            {labelFor(key, value)}
            <Icon name="x" className="size-3.5" />
            <span className="sr-only">Remove filter</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
