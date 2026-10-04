import type { getSchoolHeader } from "@/lib/schools";
import { Badge } from "@/components/common/Badge";
import { BackButton } from "@/components/common/BackButton";
import { SaveButton } from "@/components/school-profile/SaveButton";
import { StarRating } from "@/components/common/StarRating";
import { LEVEL_LABELS, TYPE_LABELS } from "@/lib/labels";

type School = NonNullable<Awaited<ReturnType<typeof getSchoolHeader>>>;

export function SchoolHeader({ school, isSaved }: { school: School; isSaved: boolean }) {
  const location = [school.khoroo && `Khoroo ${school.khoroo}`, school.district, school.aimagCity]
    .filter(Boolean)
    .join(", ");

  return (
    <header className="border-b border-zinc-200 bg-accent/[0.06] dark:border-zinc-800">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-start justify-between">
          <BackButton fallbackHref="/search" label="Back to search" />
          <SaveButton schoolId={school.id} initialSaved={isSaved} />
        </div>

        <div className="mt-4 flex flex-wrap items-start gap-2">
          <Badge tone="accent">{TYPE_LABELS[school.type]}</Badge>
          <Badge>{LEVEL_LABELS[school.level]}</Badge>
          {school.schoolNumber && <Badge>{school.schoolNumber}</Badge>}
        </div>

        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          {school.nameEn}
        </h1>
        <p className="mt-1.5 text-lg text-zinc-600 dark:text-zinc-400">{school.nameMn}</p>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <span>{location}</span>
          {school.phone && <span>{school.phone}</span>}
          {school.website && (
            <a
              href={school.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
            >
              {school.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>

        <div className="mt-5">
          <StarRating value={school.avgOverall} count={school.reviewCount} size="lg" />
        </div>
      </div>
    </header>
  );
}
