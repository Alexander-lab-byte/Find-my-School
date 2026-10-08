import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { schoolCardSelect } from "@/lib/schools";
import { HeroSearchBar } from "@/components/search/HeroSearchBar";
import { SchoolCard } from "@/components/search/SchoolCard";
import { LEVEL_LABELS, TYPE_LABELS } from "@/lib/labels";

const CHIP_CLASS =
  "rounded-full border border-zinc-200 px-3 py-1 text-zinc-600 transition-colors hover:border-accent/40 hover:text-accent dark:border-zinc-800 dark:text-zinc-400";

export default async function Home() {
  const topSchools = await prisma.school.findMany({
    where: { reviewCount: { gt: 0 } },
    orderBy: [{ avgOverall: { sort: "desc", nulls: "last" } }, { reviewCount: "desc" }],
    take: 6,
    select: schoolCardSelect,
  });

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center gap-8 px-6 py-24 text-center">
        <div className="space-y-3">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Find My School Mongolia
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Search, compare, and read real reviews of schools across Ulaanbaatar and beyond.
          </p>
        </div>

        <HeroSearchBar />

        <div className="flex flex-wrap justify-center gap-2 text-sm">
          {Object.entries(LEVEL_LABELS).map(([value, label]) => (
            <Link key={value} href={`/search?level=${value}`} className={CHIP_CLASS}>
              {label}
            </Link>
          ))}
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <Link key={value} href={`/search?type=${value}`} className={CHIP_CLASS}>
              {label}
            </Link>
          ))}
        </div>
      </main>

      {topSchools.length > 0 && (
        <section className="w-full max-w-5xl px-6 pb-20">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Top-rated schools
            </h2>
            <Link href="/search" className="text-sm text-accent underline underline-offset-4">
              See all schools
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topSchools.map((school) => (
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
