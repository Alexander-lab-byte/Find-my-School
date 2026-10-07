import Link from "next/link";
import type { Curriculum, Prisma, SchoolLevel, SchoolType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { FilterBar } from "@/components/search/FilterBar";
import { StarRating } from "@/components/common/StarRating";
import { CURRICULUM_LABELS, LEVEL_LABELS, TYPE_LABELS } from "@/lib/labels";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    level?: string;
    type?: string;
    curriculum?: string;
    dorm?: string;
  }>;
};

// Only accept values that really exist, so a bad URL can never crash the query.
function pick<T extends string>(value: string | undefined, allowed: Record<string, string>) {
  return value && value in allowed ? (value as T) : undefined;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  const q = params.q?.trim();
  const level = pick<SchoolLevel>(params.level, LEVEL_LABELS);
  const type = pick<SchoolType>(params.type, TYPE_LABELS);
  const curriculum = pick<Curriculum>(params.curriculum, CURRICULUM_LABELS);
  const dorm = params.dorm === "true";

  const where: Prisma.SchoolWhereInput = {
    AND: [
      q
        ? {
            OR: [
              { nameEn: { contains: q, mode: "insensitive" } },
              { nameMn: { contains: q, mode: "insensitive" } },
              { schoolNumber: { contains: q, mode: "insensitive" } },
              { district: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      level ? { level } : {},
      type ? { type } : {},
      curriculum ? { curriculum: { has: curriculum } } : {},
      dorm ? { dormitory: { isNot: null } } : {},
    ],
  };

  const schools = await prisma.school.findMany({
    where,
    take: 30,
    orderBy: [{ avgOverall: "desc" }, { nameEn: "asc" }],
  });

  const hasActiveFilters = Boolean(q || level || type || curriculum || dorm);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
        {q ? `Results for “${q}”` : "All schools"}
      </h1>

      <div className="mt-6">
        <FilterBar />
      </div>

      <p className="mt-6 text-sm text-zinc-500">
        {schools.length} {schools.length === 1 ? "school" : "schools"} found
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {schools.map((school) => (
          <Link
            key={school.id}
            href={`/school/${school.id}`}
            className="rounded-[var(--radius-card)] border border-zinc-200 p-4 transition-colors hover:border-accent/40 dark:border-zinc-800"
          >
            <div className="text-sm text-zinc-500">{school.district ?? school.aimagCity}</div>
            <div className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">{school.nameEn}</div>
            <div className="text-sm text-zinc-500">{school.nameMn}</div>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
              <span>{TYPE_LABELS[school.type]}</span>
              <span>{LEVEL_LABELS[school.level]}</span>
              {school.schoolNumber && <span>{school.schoolNumber}</span>}
            </div>
            <div className="mt-3">
              <StarRating value={school.avgOverall || null} count={school.reviewCount} size="sm" />
            </div>
          </Link>
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
    </div>
  );
}
