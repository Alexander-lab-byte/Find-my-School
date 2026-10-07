import Link from "next/link";
import type { getSchoolHeader } from "@/lib/schools";
import { Badge, TYPE_TONE } from "@/components/common/Badge";
import { BackButton } from "@/components/common/BackButton";
import { Icon } from "@/components/common/Icon";
import { SchoolMonogram } from "@/components/common/SchoolMonogram";
import { Stars } from "@/components/common/StarRating";
import { SaveButton } from "@/components/school-profile/SaveButton";
import { LEVEL_LABELS, TYPE_LABELS } from "@/lib/labels";

type School = NonNullable<Awaited<ReturnType<typeof getSchoolHeader>>>;

export function SchoolHeader({ school, isSaved }: { school: School; isSaved: boolean }) {
  const location = [school.khoroo && `Khoroo ${school.khoroo}`, school.district, school.aimagCity]
    .filter(Boolean)
    .join(", ");
  const hasRating = school.reviewCount > 0 && Boolean(school.avgOverall);

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto max-w-5xl px-4 pb-8 pt-6 sm:px-6 sm:pb-10">
        <div className="flex items-start justify-between gap-4">
          <BackButton fallbackHref="/search" label="Back to search" />
          <SaveButton schoolId={school.id} initialSaved={isSaved} />
        </div>

        <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 gap-4 sm:gap-5">
            <SchoolMonogram name={school.nameEn} type={school.type} logoUrl={school.logoUrl} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap gap-1.5">
                <Badge tone={TYPE_TONE[school.type]}>{TYPE_LABELS[school.type]}</Badge>
                <Badge>{LEVEL_LABELS[school.level]}</Badge>
                {school.schoolNumber && <Badge>{school.schoolNumber}</Badge>}
              </div>
              <h1 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {school.nameEn}
              </h1>
              {school.nameMn && <p className="mt-1 text-lg text-muted">{school.nameMn}</p>}

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="map-pin" className="size-4 text-subtle" />
                  {location}
                </span>
                {school.phone && (
                  <a
                    href={`tel:${school.phone}`}
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-accent"
                  >
                    <Icon name="phone" className="size-4 text-subtle" />
                    {school.phone}
                  </a>
                )}
                {school.website && (
                  <a
                    href={school.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-accent hover:underline hover:underline-offset-4"
                  >
                    <Icon name="globe" className="size-4" />
                    {school.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 rounded-xl border border-line bg-background p-5 md:w-64">
            {hasRating ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-semibold text-foreground">
                    {school.avgOverall!.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted">out of 5</span>
                </div>
                <Stars value={school.avgOverall} className="mt-2 text-lg" />
                <p className="mt-1.5 text-sm text-muted">
                  Based on {school.reviewCount} {school.reviewCount === 1 ? "review" : "reviews"}
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-foreground">No reviews yet</p>
                <p className="mt-1 text-sm text-muted">Be the first to share your experience.</p>
              </>
            )}
            <Link
              href={`/school/${school.id}/reviews#write-review`}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
            >
              <Icon name="pencil" className="size-4" />
              Write a review
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
