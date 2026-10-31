import Link from "next/link";
import type { SchoolType } from "@prisma/client";
import { useLocale, useTranslations } from "next-intl";
import type { SchoolCardData } from "@/lib/schools";
import { Badge, TYPE_TONE } from "@/components/common/Badge";
import { Icon } from "@/components/common/Icon";
import { SchoolMonogram } from "@/components/common/SchoolMonogram";
import { StarRating } from "@/components/common/StarRating";
import { CompareCheckbox } from "@/components/compare/CompareCheckbox";
import { formatLocation, schoolNames, tuitionSummary } from "@/lib/labels";

// Shown when a school has no cover photo yet: a calm type-coloured banner.
const BANNER_CLASSES: Record<SchoolType, string> = {
  PUBLIC: "from-[#dbe4ff] via-[#c7d5ff] to-[#a9bfff] dark:from-[#1a2a52] dark:via-[#20346a] dark:to-[#2a4185]",
  PRIVATE: "from-[#fde8d7] via-[#fbd5b8] to-[#f6b98f] dark:from-[#3a2a2a] dark:via-[#4a3030] dark:to-[#5e3a34]",
  INTERNATIONAL: "from-[#d9f3ec] via-[#bfe9dc] to-[#95d7c3] dark:from-[#16343a] dark:via-[#1b4148] dark:to-[#215059]",
};

// Curricula families recognise at a glance get the accent colour.
const HIGHLIGHT_CURRICULA = new Set(["IB", "CAMBRIDGE", "AP"]);

export function SchoolCard({ school }: { school: SchoolCardData }) {
  const t = useTranslations("Card");
  const tType = useTranslations("SchoolType");
  const tLevel = useTranslations("Level");
  const tCurriculum = useTranslations("CurriculumShort");
  const tTuition = useTranslations("Tuition");
  const tPlace = useTranslations("Place");
  const { primary, secondary } = schoolNames(school, useLocale());
  const location = formatLocation(tPlace, school);
  const href = `/school/${school.id}`;
  const showTuition = school.type === "PUBLIC" || school.tuitionMinAnnual || school.tuitionMaxAnnual;

  return (
    <article className="lift reveal group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-line bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.03)] hover:border-line-strong">
      {/* Cover photo, or a type-coloured banner until one is added */}
      <div className={`relative h-32 bg-gradient-to-br ${BANNER_CLASSES[school.type]}`}>
        {school.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- photos are hosted on arbitrary school sites
          <img
            src={school.coverImageUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
        <div className="absolute right-3 top-3">
          <CompareCheckbox schoolId={school.id} />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-6 pb-6">
        <div className="-mt-8 flex items-end gap-3">
          <span className="rounded-[1.4rem] bg-surface p-1 shadow-[0_6px_18px_-8px_rgb(0_0_0/0.35)]">
            <SchoolMonogram name={school.nameEn} type={school.type} logoUrl={school.logoUrl} size="lg" />
          </span>
          <div className="mb-1 flex flex-wrap gap-1.5">
            <Badge tone={TYPE_TONE[school.type]}>{tType(school.type)}</Badge>
            <Badge>{tLevel(school.level)}</Badge>
          </div>
        </div>

        <h3 className="mt-4 font-display text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-accent">
          {/* Stretched link: the whole card opens the school; the compare box sits above it. */}
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {primary}
          </Link>
        </h3>
        {secondary && <p className="mt-0.5 text-sm text-muted">{secondary}</p>}

        <ul className="mt-4 space-y-2 text-sm text-muted">
          <li className="flex items-center gap-2">
            <Icon name="map-pin" className="size-4 shrink-0 text-subtle" />
            <span className="truncate">{location}</span>
          </li>
          {showTuition && (
            <li className="flex items-center gap-2">
              <Icon name="wallet" className="size-4 shrink-0 text-subtle" />
              <span className="truncate font-medium text-foreground">
                {tuitionSummary(tTuition, school.type, school.tuitionMinAnnual, school.tuitionMaxAnnual)}
              </span>
            </li>
          )}
          {(school.foundedYear || school.studentTeacherRatio) && (
            <li className="flex items-center gap-2">
              <Icon name="calendar" className="size-4 shrink-0 text-subtle" />
              <span className="truncate">
                {[
                  school.foundedYear && t("established", { year: school.foundedYear }),
                  school.studentTeacherRatio && t("ratio", { ratio: school.studentTeacherRatio }),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </li>
          )}
        </ul>

        {(school.curriculum.length > 0 || school.dormitory) && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {school.curriculum.map((c) => (
              <Badge key={c} tone={HIGHLIGHT_CURRICULA.has(c) ? "accent" : "neutral"}>
                {tCurriculum(c)}
              </Badge>
            ))}
            {school.dormitory && (
              <Badge tone="verified">
                <Icon name="check" className="size-3" strokeWidth={3} />
                {t("dormitory")}
              </Badge>
            )}
          </div>
        )}

        {school.graduateDestinations.length > 0 && (
          <div className="mt-4 rounded-2xl bg-gold-soft px-3.5 py-3">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-gold-foreground/80 dark:text-gold">
              <Icon name="graduation" className="size-3.5" />
              {t("graduatesGoTo")}
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-foreground">
              {school.graduateDestinations.slice(0, 3).join(", ")}
              {school.graduateDestinations.length > 3 && (
                <span className="whitespace-nowrap text-muted">
                  {" "}
                  {t("more", { count: school.graduateDestinations.length - 3 })}
                </span>
              )}
            </p>
          </div>
        )}

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
            {school.reviewCount > 0 ? (
              <StarRating value={school.avgOverall} count={school.reviewCount} size="sm" />
            ) : (
              <span className="flex items-center gap-1.5 text-sm font-medium text-accent">
                <Icon name="message" className="size-4" />
                {t("beFirst")}
              </span>
            )}
            <Icon
              name="arrow-right"
              className="size-4 shrink-0 text-subtle transition group-hover:translate-x-0.5 group-hover:text-accent"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
