import Link from "next/link";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import type { SchoolType } from "@prisma/client";
import { getCitySchools, getHomepageData, getMapSchools } from "@/lib/schools";
import { NightCity } from "@/components/home/NightCity";
import { SchoolTurntable } from "@/components/home/SchoolTurntable";
import { reviewAverage } from "@/lib/ratings";
import { SCHOOL_TYPES, schoolNames } from "@/lib/labels";
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
  const [{ totalSchools, typeCounts, districts, recentReviews }, { pinned }, citySchools] = await Promise.all([
    getHomepageData(),
    getMapSchools(),
    getCitySchools(),
  ]);
  const t = await getTranslations("Home");
  const tCity = await getTranslations("City");
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
      {/* Ulaanbaatar at night in 3D — every light is a school */}
      <NightCity schools={citySchools} />

      {/* Card turntable — every school, visible straight away */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={tCity("turnEyebrow")}
            title={tCity("turnTitle")}
            description={tCity("turnLede")}
            action={
              totalSchools > 0 && (
                <Link href="/search" className="btn-secondary shrink-0">
                  {t("viewAll", { count: totalSchools })}
                  <Icon name="arrow-right" className="size-4" />
                </Link>
              )
            }
          />
        </div>
        <div className="mt-8">
          {citySchools.length > 0 ? (
            <SchoolTurntable schools={citySchools} />
          ) : (
            <p className="mx-auto max-w-6xl rounded-[1.75rem] border border-dashed border-line-strong p-10 text-center text-muted">
              {t("noSchools")}
            </p>
          )}
        </div>
      </section>

      {/* Browse by type & district */}
      <section className="relative overflow-hidden border-y border-line bg-surface/40">
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
                  className="holo lift reveal group rounded-[1.75rem] border border-line bg-surface p-7"
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
                className="holo lift reveal flex flex-col rounded-[1.75rem] border border-line bg-surface p-7"
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
        <div className="reveal relative isolate overflow-hidden rounded-[2rem] border border-line-strong bg-surface px-6 py-16 text-center sm:px-12">
          {/* A skyline of lit windows rising from the bottom edge. */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 -z-10 h-2/3 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgb(255 181 71 / 0.9) 0 1.2px, transparent 1.8px), radial-gradient(circle, rgb(143 180 255 / 0.6) 0 1px, transparent 1.5px)",
              backgroundSize: "28px 22px, 14px 14px",
              maskImage: "linear-gradient(to top, #000, transparent)",
              WebkitMaskImage: "linear-gradient(to top, #000, transparent)",
            }}
          />
          <div aria-hidden className="absolute -bottom-32 left-1/2 -z-10 h-64 w-[80%] -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
          <Icon name="message" className="relative mx-auto size-8 text-accent" />
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
