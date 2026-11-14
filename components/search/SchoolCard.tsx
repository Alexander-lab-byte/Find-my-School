import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { SchoolCardData } from "@/lib/schools";
import { Badge, TYPE_FILL } from "@/components/common/Badge";
import { Icon } from "@/components/common/Icon";
import { SchoolMonogram } from "@/components/common/SchoolMonogram";
import { Stars } from "@/components/common/StarRating";
import { CompareCheckbox } from "@/components/compare/CompareCheckbox";
import { placeName, schoolNames, tuitionSummary } from "@/lib/labels";

// Curricula families recognise at a glance get the accent colour.
const HIGHLIGHT_CURRICULA = new Set(["IB", "CAMBRIDGE", "AP"]);

/**
 * One school in a list. On wide containers it is a single row with fees and
 * rating in their own columns, so they line up down the list and are easy to
 * compare; on narrow ones the same facts stack under the name.
 */
export function SchoolCard({
  school,
  distanceKm,
  heading: Heading = "h3",
}: {
  school: SchoolCardData;
  /** Straight-line distance from the visitor, when they shared their location. */
  distanceKm?: number | null;
  /** h2 when the cards sit directly under the page title, h3 under a section title. */
  heading?: "h2" | "h3";
}) {
  const t = useTranslations("Card");
  const tCommon = useTranslations("Common");
  const tType = useTranslations("SchoolType");
  const tLevel = useTranslations("Level");
  const tCurriculum = useTranslations("CurriculumShort");
  const tTuition = useTranslations("Tuition");
  const tPlace = useTranslations("Place");
  const { primary, secondary } = schoolNames(school, useLocale());
  const place = placeName(tPlace, school.district ?? school.aimagCity);
  const hasRating = school.reviewCount > 0 && Boolean(school.avgOverall);

  return (
    <article className="plate plate-link group @container relative overflow-hidden">
      {/* The line this school is on: blue public, magenta private, teal international. */}
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${TYPE_FILL[school.type]}`} />
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3 p-4 pl-5 @[56rem]:grid-cols-[auto_minmax(0,1fr)_12.5rem_8.25rem_auto] @[56rem]:items-center @[56rem]:gap-x-5 @[56rem]:pl-6 @[56rem]:pr-5">
        <SchoolMonogram name={school.nameEn} type={school.type} logoUrl={school.logoUrl} />

        <div className="min-w-0">
          <Heading className="font-display text-[1.0625rem] font-semibold leading-snug text-foreground">
            {/* Stretched link: the whole row opens the school; the compare box sits above it. */}
            <Link
              href={`/school/${school.id}`}
              className="after:absolute after:inset-0 after:rounded-2xl after:content-[''] group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4"
            >
              {primary}
            </Link>
          </Heading>
          {secondary && <p className="truncate text-sm text-muted">{secondary}</p>}

          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span className="font-medium text-foreground">{tType(school.type)}</span>
            <span>{tLevel(school.level)}</span>
            <span className="inline-flex items-center gap-1">
              <Icon name="map-pin" className="size-3.5 text-subtle" />
              {place}
            </span>
            {distanceKm != null && (
              <span className="rounded-md bg-gold-soft px-1.5 py-0.5 text-xs font-semibold tabular-nums text-foreground">
                {t("distance", { km: distanceKm < 10 ? distanceKm.toFixed(1) : Math.round(distanceKm) })}
              </span>
            )}
          </p>

          {(school.curriculum.length > 0 || school.dormitory) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {school.curriculum.map((c) => (
                <Badge key={c} tone={HIGHLIGHT_CURRICULA.has(c) ? "accent" : "neutral"}>
                  {tCurriculum(c)}
                </Badge>
              ))}
              {school.dormitory && (
                <Badge tone="verified">
                  <Icon name="bed" className="size-3" />
                  {t("dormitory")}
                </Badge>
              )}
            </div>
          )}

        </div>

        {school.graduateDestinations.length > 0 && (
          <p className="col-span-2 line-clamp-1 text-xs leading-5 text-muted @[56rem]:col-span-4 @[56rem]:col-start-2 @[56rem]:row-start-2 @[56rem]:-mt-1">
            <span className="font-semibold">{t("graduatesGoTo")}:</span>{" "}
            {school.graduateDestinations.slice(0, 3).join(", ")}
            {school.graduateDestinations.length > 3 && (
              <> {t("more", { count: school.graduateDestinations.length - 3 })}</>
            )}{" "}
            <span className="text-subtle">({t("notVerified")})</span>
          </p>
        )}

        {/* Fees, rating, compare: a footer strip when narrow, three aligned columns when wide. */}
        <div className="col-span-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-3 @[56rem]:contents">
          <p className="font-display text-[0.9375rem] font-semibold tabular-nums text-foreground">
            {tuitionSummary(tTuition, school.type, school.tuitionMinAnnual, school.tuitionMaxAnnual)}
          </p>

          {hasRating ? (
            <p className="flex items-center gap-1.5 whitespace-nowrap text-sm">
              <Stars value={school.avgOverall} className="text-sm" />
              <span className="font-semibold tabular-nums text-foreground">{school.avgOverall!.toFixed(1)}</span>
              <span className="text-muted">({school.reviewCount})</span>
              <span className="sr-only">{tCommon("reviewCount", { count: school.reviewCount })}</span>
            </p>
          ) : (
            <p className="text-sm text-subtle">{tCommon("noReviewsYet")}</p>
          )}

          <CompareCheckbox schoolId={school.id} />
        </div>
      </div>
    </article>
  );
}
