import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { getMapSchools } from "@/lib/schools";
import { formatLocation, schoolNames } from "@/lib/labels";
import { MapExplorer } from "@/components/map/MapExplorer";
import { Icon } from "@/components/common/Icon";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Map");
  return { title: t("title") };
}

const LEGEND = [
  ["PUBLIC", "bg-accent"],
  ["PRIVATE", "bg-tone-private"],
  ["INTERNATIONAL", "bg-tone-intl"],
] as const;

export default async function MapPage() {
  const { pinned, unpinned } = await getMapSchools();
  const t = await getTranslations("Map");
  const tType = await getTranslations("SchoolType");
  const tPlace = await getTranslations("Place");
  const locale = await getLocale();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="page-title">
        {t("title")}
      </h1>
      <p className="mt-2 max-w-2xl text-muted">{t("intro")}</p>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
        <span className="font-medium text-foreground">{t("onMap", { count: pinned.length })}</span>
        {LEGEND.map(([type, color]) => (
          <span key={type} className="inline-flex items-center gap-2">
            <span aria-hidden className={`size-2.5 rounded-full ${color}`} />
            {tType(type)}
          </span>
        ))}
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-2.5 rounded-full bg-muted opacity-60" />
          {t("approximate")}
        </span>
      </div>

      <div className="mt-4">
        <MapExplorer schools={pinned} />
      </div>

      {unpinned.length > 0 && (
        <section className="mt-10">
          <h2 className="section-title">{t("notPinnedTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{t("notPinnedBody")}</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {unpinned.map((school) => {
              const { primary } = schoolNames(school, locale);
              return (
                <li key={school.id}>
                  <Link
                    href={`/school/${school.id}`}
                    className="flex h-full items-start gap-3 plate p-4 transition-colors hover:border-line-strong"
                  >
                    <Icon name="map-pin" className="mt-0.5 size-4 shrink-0 text-subtle" />
                    <span className="min-w-0">
                      <span className="block font-medium text-foreground">{primary}</span>
                      <span className="mt-0.5 block text-sm text-muted">
                        {[school.address, formatLocation(tPlace, school)].filter(Boolean).join(", ")}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
