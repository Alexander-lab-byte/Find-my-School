"use client";

import { useSearchNavigation } from "@/components/search/SearchNavigation";
import { CURRICULUM_LABELS, LEVEL_LABELS, TYPE_LABELS } from "@/lib/labels";

export const FILTER_KEYS = ["level", "type", "curriculum", "dorm"] as const;

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-zinc-200 text-zinc-600 hover:border-accent/40 dark:border-zinc-700 dark:text-zinc-400"
      }`}
    >
      {children}
    </button>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-24 shrink-0 text-sm text-zinc-500">{label}</span>
      {children}
    </div>
  );
}

export function FilterBar() {
  const { searchParams, update } = useSearchNavigation();

  function toggle(key: string, value: string) {
    update({ [key]: searchParams.get(key) === value ? null : value });
  }

  function clearFilters() {
    update(Object.fromEntries(FILTER_KEYS.map((k) => [k, null])));
  }

  const hasFilters = FILTER_KEYS.some((k) => searchParams.has(k));

  return (
    <div className="space-y-3 rounded-[var(--radius-card)] border border-zinc-200 p-4 dark:border-zinc-800">
      <Group label="Level">
        {Object.entries(LEVEL_LABELS).map(([value, label]) => (
          <Chip key={value} active={searchParams.get("level") === value} onClick={() => toggle("level", value)}>
            {label}
          </Chip>
        ))}
      </Group>

      <Group label="Type">
        {Object.entries(TYPE_LABELS).map(([value, label]) => (
          <Chip key={value} active={searchParams.get("type") === value} onClick={() => toggle("type", value)}>
            {label}
          </Chip>
        ))}
      </Group>

      <Group label="Curriculum">
        {Object.entries(CURRICULUM_LABELS).map(([value, label]) => (
          <Chip
            key={value}
            active={searchParams.get("curriculum") === value}
            onClick={() => toggle("curriculum", value)}
          >
            {label}
          </Chip>
        ))}
      </Group>

      <Group label="Features">
        <Chip active={searchParams.get("dorm") === "true"} onClick={() => toggle("dorm", "true")}>
          Has dormitory
        </Chip>
      </Group>

      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="inline-block text-sm text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
