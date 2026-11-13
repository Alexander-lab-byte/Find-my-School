import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { getSchoolHeader } from "@/lib/schools";
import { Badge, TYPE_FILL } from "@/components/common/Badge";
import { BackButton } from "@/components/common/BackButton";
import { Icon } from "@/components/common/Icon";
import { SchoolMonogram } from "@/components/common/SchoolMonogram";
import { Stars } from "@/components/common/StarRating";
import { SaveButton } from "@/components/school-profile/SaveButton";
import { CompareButton } from "@/components/compare/CompareButton";
import { displayUrl, externalUrl, formatLocation, schoolNames } from "@/lib/labels";

type School = NonNullable<Awaited<ReturnType<typeof getSchoolHeader>>>;

export function SchoolHeader({
  school,
  isSaved,
}: {
  school: School;
  isSaved: boolean;
}) {
  const t = useTranslations("Profile");
  const tCommon = useTranslations("Common");
  const tType = useTranslations("SchoolType");
  const tLevel = useTranslations("Level");
  const location = formatLocation(useTranslations("Place"), school);
  const { primary, secondary } = schoolNames(school, useLocale());
  const website = externalUrl(school.website);
  const hasRating = school.reviewCount > 0 && Boolean(school.avgOverall);

  return (
    <header className="border-b border-line bg-surface">
      {/* The line this school is on, as on its cards and map pin. */}
      <div aria-hidden className={`h-1.5 ${TYPE_FILL[school.type]}`} />
      <div className="mx-auto max-w-5xl px-4 pb-7 pt-4 sm:px-6 sm:pb-9">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <BackButton fallbackHref="/search" label={tCommon("backToSearch")} />
          <div className="flex items-start gap-2">
            <CompareButton schoolId={school.id} />
            <SaveButton schoolId={school.id} initialSaved={isSaved} />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-7 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 gap-4 sm:gap-5">
            <SchoolMonogram name={school.nameEn} type={school.type} logoUrl={school.logoUrl} size="lg" />
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                  <span aria-hidden className={`size-2.5 rounded-full ${TYPE_FILL[school.type]}`} />
                  {tType(school.type)}
                </span>
                <span>{tLevel(school.level)}</span>
                {school.schoolNumber && !school.nameEn.includes(school.schoolNumber) && (
                  <Badge>{school.schoolNumber}</Badge>
                )}
              </p>
              <h1 className="page-title mt-2">{primary}</h1>
              {secondary && <p className="mt-1.5 text-lg leading-snug text-muted">{secondary}</p>}

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
                <span className="inline-flex min-h-8 items-center gap-1.5">
                  <Icon name="map-pin" className="size-4 shrink-0 text-subtle" />
                  {location}
                </span>
                {website && (
                  <a href={website} target="_blank" rel="noopener noreferrer" className="link inline-flex min-h-8 items-center gap-1.5">
                    <Icon name="globe" className="size-4 shrink-0" />
                    {displayUrl(website)}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 rounded-2xl bg-background p-5 md:w-64">
            {hasRating ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-bold tabular-nums text-foreground">
                    {school.avgOverall!.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted">{t("outOf5")}</span>
                </div>
                <Stars value={school.avgOverall} className="mt-1.5 text-lg" />
                <p className="mt-1.5 text-sm text-muted">{t("basedOn", { count: school.reviewCount })}</p>
              </>
            ) : (
              <>
                <p className="font-display font-semibold text-foreground">{tCommon("noReviewsYet")}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{t("beFirst")}</p>
              </>
            )}
            <Link href={`/school/${school.id}/reviews#write-review`} className="btn-primary mt-4 w-full">
              <Icon name="pencil" className="size-4" />
              {tCommon("writeReview")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
