import type { Metadata } from "next";
import Link from "next/link";
import {
  SEARCH_PAGE_SIZE,
  getDistricts,
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
import { PendingArea, SearchNavigationProvider } from "@/components/search/SearchNavigation";
import { Icon } from "@/components/common/Icon";

export const metadata: Metadata = {
  title: "Browse schools",
};

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const filters = parseSchoolFilters(params);
  const sort = parseSort(params.sort);
  const page = parsePage(params.page);

  const [{ schools, total }, districts] = await Promise.all([
    searchSchools({ filters, sort, page }),
    getDistricts(),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / SEARCH_PAGE_SIZE));
  const isFiltered = hasActiveFilters(filters);

  return (
    <SearchNavigationProvider>
      <main>
        <div className="border-b border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Directory</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {filters.q ? <>Results for “{filters.q}”</> : "Browse schools"}
            </h1>
            <p className="mt-2 max-w-2xl text-muted">
              Narrow the list by type, level, curriculum, or district. Results update as you go.
            </p>
            <div className="mt-6 max-w-3xl">
              <SearchInput />
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <FilterBar districts={districts} />
          </aside>

          <section aria-label="Results" className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted" aria-live="polite">
                <span className="font-semibold text-foreground">{total}</span>{" "}
                {total === 1 ? "school" : "schools"}
                {isFiltered ? " match your search" : " listed"}
              </p>
              <SortSelect value={sort} />
            </div>

            <ActiveFilters />

            <PendingArea>
              {schools.length > 0 ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {schools.map((school) => (
                      <SchoolCard key={school.id} school={school} />
                    ))}
                  </div>
                  <Pagination page={page} pageCount={pageCount} params={params} />
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
                  <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-muted text-subtle">
                    <Icon name="search" className="size-5" />
                  </span>
                  <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
                    {total > 0
                      ? "This page is empty"
                      : isFiltered
                        ? "No schools match your search"
                        : "No schools have been added yet"}
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                    {total > 0
                      ? "There are fewer results than this page number."
                      : isFiltered
                        ? "Try removing a filter, or search by district or city instead."
                        : "Check back soon — we're adding schools across Mongolia."}
                  </p>
                  {(isFiltered || total > 0) && (
                    <Link
                      href="/search"
                      className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
                    >
                      Show all schools
                    </Link>
                  )}
                </div>
              )}
            </PendingArea>
          </section>
        </div>
      </main>
    </SearchNavigationProvider>
  );
}
