import Link from "next/link";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import type { SchoolType } from "@prisma/client";
import { getHomepageData, getMapSchools } from "@/lib/schools";
import { HeroSearchBar } from "@/components/search/HeroSearchBar";
import { reviewAverage } from "@/lib/ratings";
import { SCHOOL_TYPES, schoolNames } from "@/lib/labels";
import { SchoolCard } from "@/components/search/SchoolCard";
import { Icon, type IconName } from "@/components/common/Icon";
import { Stars } from "@/components/common/StarRating";
import { SchoolMap } from "@/components/map/SchoolMap";

const TYPE_ICONS: Record<SchoolType, IconName> = {
  PUBLIC: "landmark",
  PRIVATE: "building",
  INTERNATIONAL: "globe",
};

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="reveal flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          {title}
        </h2>
        {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export default async function Home() {
  const [{ schools, totalSchools, typeCounts, districts, recentReviews }, { pinned }] = await Promise.all([
    getHomepageData(),
    getMapSchools(),
  ]);
  const t = await getTranslations("Home");
  const tMap = await getTranslations("Map");
  const tCommon = await getTranslations("Common");
  const tType = await getTranslations("SchoolTypePlural");
  const tTypeDescription = await getTranslations("SchoolTypeDescription");
  const tRole = await getTranslations("Role");
  const tPlace = await getTranslations("Place");
  const format = await getFormatter();
  const locale = await getLocale();

  return (
    <main>
      {/* Hero: search first — one input instead of a questionnaire */}
      <section className="relative -mt-16 overflow-hidden bg-gradient-to-b from-[#6f98ee] via-[#a9c6f7] to-[#dce7fa] pt-16 dark:from-[#0e1a3a] dark:via-[#16264d] dark:to-[#1a2a52]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_circle_at_85%_15%,rgba(255,226,150,.5),transparent_70%)] dark:opacity-30"
        />
        <div aria-hidden className="cloud cloud-drift pointer-events-none absolute -left-20 top-24 h-28 w-72 opacity-70 max-md:hidden" />
        <div aria-hidden className="cloud cloud-drift pointer-events-none absolute -right-16 bottom-10 h-32 w-80 opacity-70 [animation-delay:-4s] max-md:hidden" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-20 pt-16 text-center sm:px-6 sm:pb-24 sm:pt-20">
          <p className="eyebrow !text-[#16309f] dark:!text-[#b3c3ff]">{t("eyebrow")}</p>
          <h1 className="mt-3 max-w-3xl text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-[#0b1220] sm:text-6xl dark:text-white">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-[#1e2a44] sm:text-lg dark:text-white/80">
            {t("subtitle")}
          </p>

          <div className="mt-8 flex w-full justify-center">
            <HeroSearchBar />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm font-semibold text-[#1e2a44] dark:text-white/70">{t("browseLabel")}</span>
            {(
              [
                ["/search?type=PUBLIC", "quickPublic"],
                ["/search?type=PRIVATE", "quickPrivate"],
                ["/search?type=INTERNATIONAL", "quickInternational"],
                ["/search?level=HIGH", "quickHigh"],
                ["/search?dorm=true", "quickDorm"],
              ] as const
            ).map(([href, key]) => (
              <Link key={key} href={href} className="chip">
                {t(key)}
              </Link>
            ))}
          </div>

          {totalSchools > 0 && (
            <p className="mt-6 text-sm font-medium text-[#1e2a44]/80 dark:text-white/60">
              {tCommon("schoolCount", { count: totalSchools })}
            </p>
          )}
        </div>
      </section>

      {/* School list — visible straight away, no search needed */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <SectionHeading
          eyebrow={t("directoryEyebrow")}
          title={t("directoryTitle")}
          description={t("directoryDescription")}
          action={
            totalSchools > 0 && (
              <Link
                href="/search"
                className="btn-secondary shrink-0"
              >
                {t("viewAll", { count: totalSchools })}
                <Icon name="arrow-right" className="size-4" />
              </Link>
            )
          }
        />

        {schools.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {schools.map((school) => (
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-[1.75rem] border border-dashed border-line-strong p-10 text-center text-muted">
            {t("noSchools")}
          </p>
        )}
      </section>

      {/* Browse by type & district */}
      <section className="relative overflow-hidden bg-surface-muted/60">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <SectionHeading
            eyebrow={t("browseEyebrow")}
            title={t("browseTitle")}
            description={t("browseDescription")}
          />

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {SCHOOL_TYPES.map((type) => {
              const count = typeCounts[type] ?? 0;
              return (
                <Link
                  key={type}
                  href={`/search?type=${type}`}
                  className="lift reveal group rounded-[1.75rem] border border-line bg-surface p-7"
                >
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                    <Icon name={TYPE_ICONS[type]} className="size-5" />
                  </span>
                  <h3 className="mt-5 font-display text-2xl font-bold text-foreground">
                    {tType(type)}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{tTypeDescription(type)}</p>
                  <p className="mt-5 flex items-center gap-1.5 text-sm font-bold text-accent">
                    {tCommon("schoolCount", { count })}
                    <Icon
                      name="arrow-right"
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                    />
                  </p>
                </Link>
              );
            })}
          </div>

          {districts.length > 0 && (
            <div className="mt-10">
              <h3 className="text-sm font-extrabold text-foreground">{t("byDistrict")}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {districts.map(({ name, count }) => (
                  <Link
                    key={name}
                    href={`/search?district=${encodeURIComponent(name)}`}
                    className="chip"
                  >
                    {tPlace.has(name) ? tPlace(name) : name}
                    <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs tabular-nums text-muted">{count}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Map preview */}
      {pinned.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <SectionHeading
            eyebrow={tMap("eyebrow")}
            title={tMap("homeTitle")}
            description={tMap("homeDescription")}
            action={
              <Link
                href="/map"
                className="btn-secondary shrink-0"
              >
                {tMap("openFull")}
                <Icon name="arrow-right" className="size-4" />
              </Link>
            }
          />
          <div className="reveal mt-8 overflow-hidden rounded-[1.75rem] shadow-[var(--shadow-card)]">
            <SchoolMap schools={pinned} height={460} />
          </div>
        </section>
      )}

      {/* Recent reviews — only once there are some */}
      {recentReviews.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <SectionHeading eyebrow={t("communityEyebrow")} title={t("recentlyReviewed")} />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {recentReviews.map((review) => (
              <article
                key={review.id}
                className="lift reveal flex flex-col rounded-[1.75rem] border border-line bg-surface p-7"
              >
                <Stars value={reviewAverage(review.rating)} className="text-base" />
                <p className="mt-3 line-clamp-4 text-sm leading-6 text-foreground">
                  “{review.bodyText}”
                </p>
                <div className="mt-auto pt-5 text-sm">
                  <Link
                    href={`/school/${review.school.id}/reviews`}
                    className="font-bold text-accent hover:underline hover:underline-offset-4"
                  >
                    {schoolNames(review.school, locale).primary}
                  </Link>
                  <p className="mt-0.5 text-xs text-subtle">
                    {tRole(review.user.role)} · {format.dateTime(review.createdAt, { dateStyle: "long" })}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Call to action */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="reveal relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#6f98ee] via-[#a9c6f7] to-[#dce7fa] px-6 py-16 text-center text-[#0b1220] sm:px-12 dark:from-[#16264d] dark:via-[#1d3266] dark:to-[#26386b] dark:text-white">
          <div aria-hidden className="cloud cloud-drift pointer-events-none absolute -left-16 top-6 h-28 w-72 opacity-90" />
          <div aria-hidden className="cloud cloud-drift pointer-events-none absolute -right-10 bottom-4 h-32 w-80 opacity-90 [animation-delay:-4s]" />
          <Icon name="message" className="relative mx-auto size-8 opacity-80" />
          <h2 className="relative mx-auto mt-4 max-w-xl text-balance font-display text-4xl font-extrabold tracking-tight">
            {t("ctaTitle")}
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-pretty leading-7 opacity-85">
            {t("ctaBody")}
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/search"
              className="btn-primary"
            >
              {t("ctaFind")}
              <Icon name="arrow-right" className="size-4" />
            </Link>
            <Link
              href="/register"
              className="btn-secondary"
            >
              {t("ctaRegister")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
