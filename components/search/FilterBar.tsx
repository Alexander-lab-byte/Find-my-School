"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/common/Icon";
import { useSearchNavigation } from "@/components/search/SearchNavigation";
import { CURRICULA, LEVELS, SCHOOL_TYPES } from "@/lib/labels";

export const FILTER_KEYS = ["type", "level", "curriculum", "district", "dorm"] as const;

function Option({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
        active
          ? "bg-accent-soft font-medium text-accent"
          : "text-muted hover:bg-surface-muted hover:text-foreground"
      }`}
    >
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
          active ? "border-accent bg-accent text-accent-foreground" : "border-line-strong"
        }`}
      >
        {active && <Icon name="check" className="size-2.5" strokeWidth={3.5} />}
      </span>
      <span className="flex-1">{children}</span>
      {count !== undefined && <span className="text-xs tabular-nums text-subtle">{count}</span>}
    </button>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-line pt-4">
      <legend className="sr-only">{title}</legend>
      <p aria-hidden className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </fieldset>
  );
}

export function FilterBar({ districts }: { districts: { name: string; count: number }[] }) {
  const t = useTranslations("Filters");
  const tType = useTranslations("SchoolType");
  const tLevel = useTranslations("Level");
  const tCurriculum = useTranslations("Curriculum");
  const tPlace = useTranslations("Place");
  const { searchParams, update } = useSearchNavigation();
  const [isOpen, setIsOpen] = useState(false);

  const activeCount = FILTER_KEYS.filter((key) => searchParams.has(key)).length;

  function toggle(key: (typeof FILTER_KEYS)[number], value: string) {
    update({ [key]: searchParams.get(key) === value ? null : value });
  }

  function clearAll() {
    update(Object.fromEntries(FILTER_KEYS.map((key) => [key, null])));
  }

  return (
    <div>
      {/* On small screens the filters fold away behind a toggle. */}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="search-filters"
        className="flex w-full items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-foreground lg:hidden"
      >
        <span className="flex items-center gap-2">
          <Icon name="sliders" className="size-4" />
          {t("filters")}
          {activeCount > 0 && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
              {activeCount}
            </span>
          )}
        </span>
        <Icon
          name="chevron-down"
          className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div
        id="search-filters"
        className={`${isOpen ? "mt-3 block" : "hidden"} space-y-4 rounded-xl border border-line bg-surface p-4 lg:mt-0 lg:block`}
      >
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-semibold text-foreground">{t("filters")}</h2>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-medium text-accent underline-offset-4 hover:underline"
            >
              {t("clearAll")}
            </button>
          )}
        </div>

        <Group title={t("type")}>
          {SCHOOL_TYPES.map((value) => (
            <Option
              key={value}
              active={searchParams.get("type") === value}
              onClick={() => toggle("type", value)}
            >
              {tType(value)}
            </Option>
          ))}
        </Group>

        <Group title={t("level")}>
          {LEVELS.map((value) => (
            <Option
              key={value}
              active={searchParams.get("level") === value}
              onClick={() => toggle("level", value)}
            >
              {tLevel(value)}
            </Option>
          ))}
        </Group>

        <Group title={t("curriculum")}>
          {CURRICULA.map((value) => (
            <Option
              key={value}
              active={searchParams.get("curriculum") === value}
              onClick={() => toggle("curriculum", value)}
            >
              {tCurriculum(value)}
            </Option>
          ))}
        </Group>

        {districts.length > 0 && (
          <Group title={t("district")}>
            {districts.map(({ name, count }) => (
              <Option
                key={name}
                active={searchParams.get("district") === name}
                onClick={() => toggle("district", name)}
                count={count}
              >
                {tPlace.has(name) ? tPlace(name) : name}
              </Option>
            ))}
          </Group>
        )}

        <Group title={t("features")}>
          <Option active={searchParams.get("dorm") === "true"} onClick={() => toggle("dorm", "true")}>
            {t("hasDorm")}
          </Option>
        </Group>
      </div>
    </div>
  );
}
