import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  SEARCH_PAGE_SIZE,
  getDistricts,
  getTeachingLanguages,
  hasActiveFilters,
  parsePage,
  parseSchoolFilters,
  parseSort,
  searchSchools,
} from "@/lib/schools";
import { ActiveFilters } from "@/components/search/ActiveFilters";
import { FilterBar } from "@/components/search/FilterBar";
import { Pagination } from "@/components/search/Pagination";
import { SchoolCard } from "@/components/search/SchoolCard";
import { SearchInput, SortSelect } from "@/components/search/SearchControls";
import { NearMeButton } from "@/components/search/NearMeButton";
import { parseNear } from "@/lib/geo";
import { PendingArea, SearchNavigationProvider } from "@/components/search/SearchNavigation";
import { EmptyState } from "@/components/common/EmptyState";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return { title: t("browse") };
}

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const filters = parseSchoolFilters(params);
  const sort = parseSort(params.sort);
  const page = parsePage(params.page);
  const near = parseNear(params.near);

  const [{ schools, total, sort: appliedSort }, districts, languages] = await Promise.all([
    searchSchools({ filters, sort, page, near }),
    getDistricts(),
    getTeachingLanguages(),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / SEARCH_PAGE_SIZE));
  const isFiltered = hasActiveFilters(filters);
  const t = await getTranslations("Search");

  return (
    <SearchNavigationProvider>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="page-title">{filters.q ? t("resultsFor", { query: filters.q }) : t("title")}</h1>
        <p className="mt-2 max-w-2xl text-muted">{t("intro")}</p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <SearchInput />
          </div>
          <NearMeButton active={Boolean(near)} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8">
          <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:self-start lg:overflow-y-auto">
            <FilterBar districts={districts} languages={languages} />
          </aside>

          <section aria-label={t("results")} className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted" aria-live="polite">
                {t.rich(isFiltered ? "countMatching" : "countListed", {
                  count: total,
                  b: (chunks) => <span className="font-semibold text-foreground">{chunks}</span>,
                })}
              </p>
              <SortSelect value={appliedSort} hasLocation={Boolean(near)} />
            </div>

            <ActiveFilters />

            <PendingArea>
              {schools.length > 0 ? (
                <div className="space-y-6">
                  <ul className="space-y-3">
                    {schools.map((school) => (
                      <li key={school.id}>
                        <SchoolCard school={school} distanceKm={school.distanceKm} heading="h2" />
                      </li>
                    ))}
                  </ul>
                  <Pagination page={page} pageCount={pageCount} params={params} />
                </div>
              ) : (
                <EmptyState
                  icon="search"
                  title={total > 0 ? t("emptyPageTitle") : isFiltered ? t("noMatchTitle") : t("noneTitle")}
                  body={total > 0 ? t("emptyPageBody") : isFiltered ? t("noMatchBody") : t("noneBody")}
                >
                  {(isFiltered || total > 0) && (
                    <Link href="/search" className="btn-primary">
                      {t("showAll")}
                    </Link>
                  )}
                </EmptyState>
              )}
            </PendingArea>
          </section>
        </div>
      </main>
    </SearchNavigationProvider>
  );
}
