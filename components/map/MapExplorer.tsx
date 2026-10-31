"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { SchoolType } from "@prisma/client";
import { SchoolMap, type MapPoint } from "@/components/map/SchoolMap";
import { Icon } from "@/components/common/Icon";
import { formatLocation, schoolNames } from "@/lib/labels";

const DOT: Record<SchoolType, string> = {
  PUBLIC: "bg-accent",
  PRIVATE: "bg-tone-private",
  INTERNATIONAL: "bg-tone-intl",
};

const MAP_HEIGHT = 560;

/**
 * The full map with a list beside it (below it on phones). Picking a school
 * in the list flies the map to its pin and opens it; clicking a pin
 * highlights and scrolls to that school in the list.
 */
export function MapExplorer({ schools }: { schools: MapPoint[] }) {
  const t = useTranslations("Map");
  const tType = useTranslations("SchoolType");
  const tPlace = useTranslations("Place");
  const locale = useLocale();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const items = useRef(new Map<string, HTMLLIElement>());

  // Keep the picked school visible in the list when it came from a pin click.
  useEffect(() => {
    if (selectedId) items.current.get(selectedId)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedId]);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <SchoolMap
        schools={schools}
        height={MAP_HEIGHT}
        scrollZoom
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      <div className="flex max-h-80 flex-col overflow-hidden rounded-[1.75rem] border border-line bg-surface lg:max-h-[560px]">
        <p className="border-b border-line px-4 py-3 text-sm font-semibold text-foreground">
          {t("listTitle", { count: schools.length })}
        </p>
        <ul className="flex-1 overflow-y-auto p-2">
          {schools.map((school) => {
            const { primary } = schoolNames(school, locale);
            const selected = school.id === selectedId;
            return (
              <li
                key={school.id}
                ref={(el) => {
                  if (el) items.current.set(school.id, el);
                  else items.current.delete(school.id);
                }}
              >
                <div
                  className={`flex items-center gap-1 rounded-2xl transition-colors ${
                    selected ? "bg-accent-soft" : "hover:bg-surface-muted"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(school.id)}
                    aria-pressed={selected}
                    className="flex min-h-12 min-w-0 flex-1 items-center gap-3 px-3 py-2 text-left"
                  >
                    <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${DOT[school.type]}`} />
                    <span className="min-w-0">
                      <span className={`block truncate text-sm font-semibold ${selected ? "text-accent" : "text-foreground"}`}>
                        {primary}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {tType(school.type)} · {formatLocation(tPlace, school)}
                      </span>
                    </span>
                  </button>
                  <Link
                    href={`/school/${school.id}`}
                    aria-label={`${t("viewProfile")}: ${primary}`}
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl text-subtle transition-colors hover:text-accent"
                  >
                    <Icon name="arrow-right" className="size-4" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
