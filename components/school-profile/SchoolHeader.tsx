import type { getSchoolHeader } from "@/lib/schools";
import { Badge, TYPE_TONE } from "@/components/common/Badge";
import { SchoolMonogram } from "@/components/common/SchoolMonogram";
import { BackButton } from "@/components/common/BackButton";
import { SaveButton } from "@/components/school-profile/SaveButton";
import { CompareButton } from "@/components/compare/CompareButton";
import { StarRating } from "@/components/common/StarRating";
import { LEVEL_LABELS, TYPE_LABELS } from "@/lib/labels";

type School = NonNullable<Awaited<ReturnType<typeof getSchoolHeader>>>;

export function SchoolHeader({ school, isSaved }: { school: School; isSaved: boolean }) {
  const location = [school.khoroo && `Khoroo ${school.khoroo}`, school.district, school.aimagCity]
    .filter(Boolean)
    .join(", ");

  // Data may store "www.school.mn" with no protocol, which would otherwise
  // become a broken relative link.
  const websiteUrl = school.website
    ? /^https?:\/\//i.test(school.website)
      ? school.website
      : `https://${school.website}`
    : null;

  return (
    <header className="border-b border-zinc-200 bg-accent/[0.06] dark:border-zinc-800">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-start justify-between">
          <BackButton fallbackHref="/search" label="Back to search" />
          <div className="flex items-start gap-2">
            <CompareButton schoolId={school.id} />
            <SaveButton schoolId={school.id} initialSaved={isSaved} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-start gap-2">
          <Badge tone={TYPE_TONE[school.type]}>{TYPE_LABELS[school.type]}</Badge>
          <Badge>{LEVEL_LABELS[school.level]}</Badge>
          {school.schoolNumber && <Badge>{school.schoolNumber}</Badge>}
        </div>

        <div className="mt-4 flex items-start gap-4 sm:gap-5">
          <SchoolMonogram
            name={school.nameEn}
            type={school.type}
            logoUrl={school.logoUrl}
            size="lg"
          />
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
              {school.nameEn}
            </h1>
            <p className="mt-1.5 text-lg text-zinc-600 dark:text-zinc-400">{school.nameMn}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <span>{location}</span>
          {school.phone && <span>{school.phone}</span>}
          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
            >
              {websiteUrl.replace(/^https?:\/\//, "")}
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
