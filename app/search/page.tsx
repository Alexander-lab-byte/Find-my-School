import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type SearchPageProps = {
  searchParams: Promise<{ q?: string; level?: string; type?: string; dorm?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  const where: Prisma.SchoolWhereInput = {
    AND: [
      params.q
        ? {
            OR: [
              { nameEn: { contains: params.q, mode: "insensitive" } },
              { nameMn: { contains: params.q, mode: "insensitive" } },
              { schoolNumber: { contains: params.q, mode: "insensitive" } },
              { district: { contains: params.q, mode: "insensitive" } },
            ],
          }
        : {},
      params.level ? { level: params.level as Prisma.EnumSchoolLevelFilter["equals"] } : {},
      params.type ? { type: params.type as Prisma.EnumSchoolTypeFilter["equals"] } : {},
    ],
  };

  const schools = await prisma.school.findMany({
    where,
    take: 30,
    orderBy: { avgOverall: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-semibold">
        {params.q ? `Results for "${params.q}"` : "All schools"}
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {schools.map((school) => (
          <a
            key={school.id}
            href={`/school/${school.id}`}
            className="rounded-[var(--radius-card)] border border-zinc-200 p-4 transition-colors hover:border-accent/40 dark:border-zinc-800"
          >
            <div className="flex flex-wrap items-center gap-x-2 text-sm text-zinc-500">
              <span>{school.district ?? school.aimagCity}</span>
              {school.schoolNumber && (
                <>
                  <span aria-hidden className="text-zinc-300 dark:text-zinc-700">
                    |
                  </span>
                  <span>{school.schoolNumber}</span>
                </>
              )}
            </div>
            <div className="mt-1 font-medium">{school.nameEn}</div>
            <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
              <span>★ {school.avgOverall?.toFixed(1) ?? "—"}</span>
              <span>({school.reviewCount} reviews)</span>
            </div>
          </a>
        ))}
        {schools.length === 0 && (
          <p className="text-zinc-500">No schools match your search yet.</p>
        )}
      </div>
    </div>
  );
}
