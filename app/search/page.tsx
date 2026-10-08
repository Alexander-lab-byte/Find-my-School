import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { schoolCardSelect } from "@/lib/schools";
import {
  PAGE_SIZE,
  buildSchoolOrderBy,
  buildSchoolWhere,
  parseSchoolSearch,
} from "@/lib/school-search";
import { SchoolCard } from "@/components/search/SchoolCard";
import { FilterBar } from "@/components/search/FilterBar";
import { ActiveFilters } from "@/components/search/ActiveFilters";
import { Pagination } from "@/components/search/Pagination";
import { SearchInput, SortSelect } from "@/components/search/SearchControls";
import { PendingArea, SearchNavigationProvider } from "@/components/search/SearchNavigation";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const rawParams = await searchParams;
  const search = parseSchoolSearch(rawParams);
  const where = buildSchoolWhere(search);

  const total = await prisma.school.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // A stale or hand-edited ?page=99 just lands on the last page.
  const page = Math.min(search.page, pageCount);

  const schools = await prisma.school.findMany({
    where,
    orderBy: buildSchoolOrderBy(search.sort),
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: schoolCardSelect,
  });

  const hasActiveFilters = Boolean(
    search.q || search.level || search.type || search.curriculum || search.dorm,
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
        {search.q ? `Results for “${search.q}”` : "All schools"}
      </h1>

      <SearchNavigationProvider>
        <div className="mt-6 space-y-4">
          <SearchInput />
          <FilterBar />
          <ActiveFilters />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-500">
            {total} {total === 1 ? "school" : "schools"} found
          </p>
          <SortSelect value={search.sort} />
        </div>

        <PendingArea>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {schools.map((school) => (
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>

          {schools.length === 0 && (
            <div className="mt-4 rounded-[var(--radius-card)] border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
              <p className="text-zinc-600 dark:text-zinc-400">
                No schools match{hasActiveFilters ? " these filters" : " yet"}.
              </p>
              {hasActiveFilters && (
                <Link
                  href="/search"
                  className="mt-2 inline-block text-sm text-accent underline underline-offset-4"
                >
                  Clear everything and start over
                </Link>
              )}
            </div>
          )}

          <div className="mt-8">
            <Pagination page={page} pageCount={pageCount} params={rawParams} />
          </div>
        </PendingArea>
      </SearchNavigationProvider>
    </div>
  );
}
