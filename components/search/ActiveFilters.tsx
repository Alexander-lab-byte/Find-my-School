"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@/components/common/Icon";
import { FILTER_KEYS } from "@/components/search/FilterBar";
import { useSearchNavigation } from "@/components/search/SearchNavigation";

/** Removable pills summarising the filters currently applied. */
export function ActiveFilters() {
  const t = useTranslations("Filters");
  const tType = useTranslations("SchoolType");
  const tLevel = useTranslations("Level");
  const tCurriculum = useTranslations("Curriculum");
  const tPlace = useTranslations("Place");
  const { searchParams, update } = useSearchNavigation();

  function labelFor(key: (typeof FILTER_KEYS)[number], value: string) {
    switch (key) {
      case "type":
        return tType.has(value) ? tType(value) : value;
      case "level":
        return tLevel.has(value) ? tLevel(value) : value;
      case "curriculum":
        return tCurriculum.has(value) ? tCurriculum(value) : value;
      case "dorm":
        return t("hasDorm");
      default:
        return tPlace.has(value) ? tPlace(value) : value;
    }
  }

  const active = FILTER_KEYS.flatMap((key) => {
    const value = searchParams.get(key);
    return value ? [{ key, value }] : [];
  });

  if (active.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2" aria-label={t("active")}>
      {active.map(({ key, value }) => (
        <li key={key}>
          <button
            type="button"
            onClick={() => update({ [key]: null })}
            className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft py-1 pl-3 pr-2 text-xs font-medium text-accent transition-colors hover:border-accent"
          >
            {labelFor(key, value)}
            <Icon name="x" className="size-3.5" />
            <span className="sr-only">{t("remove")}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
