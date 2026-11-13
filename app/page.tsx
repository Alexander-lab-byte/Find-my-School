import Link from "next/link";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { getHomepageData, getMapSchools } from "@/lib/schools";
import { reviewAverage } from "@/lib/ratings";
import { placeName, schoolNames } from "@/lib/labels";
import { SchoolCard } from "@/components/search/SchoolCard";
import { Icon } from "@/components/common/Icon";
import { Stars } from "@/components/common/StarRating";
import { EmptyState } from "@/components/common/EmptyState";
import { PathMap } from "@/components/home/PathMap";
import { ScrollStory } from "@/components/home/ScrollStory";
import { LazyMap } from "@/components/map/LazyMap";

export default async function Home() {
  const [{ schools, totalSchools, typeCounts, districts, recentReviews }, { pinned }] = await Promise.all([
    getHomepageData(),
    getMapSchools(),
  ]);
  const t = await getTranslations("Home");
  const tMap = await getTranslations("Map");
  const tMatch = await getTranslations("Match");
  const tCommon = await getTranslations("Common");
  const tRole = await getTranslations("Role");
  const tPlace = await getTranslations("Place");
  const format = await getFormatter();
  const locale = await getLocale();
  const mostInDistrict = Math.max(1, ...districts.map((d) => d.count));

  return (
    <main>
      {/* The opening: a 3D scene you scroll through, from the headline to "university". */}
      <ScrollStory typeCounts={typeCounts} totalSchools={totalSchools} />

      {/* Two ways in: browse by stage or kind of school, or answer five questions. */}
      <section id="browse" className="mx-auto grid max-w-6xl scroll-mt-20 gap-5 px-4 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
        <PathMap typeCounts={typeCounts} />
        <div className="flex flex-col justify-between gap-6 rounded-2xl bg-gold p-6 text-gold-foreground shadow-[var(--shadow-pop)] sm:p-7">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-[-0.02em] sm:text-[1.75rem]">{tMatch("title")}</h2>
            <p className="mt-2 leading-7">{tMatch("intro")}</p>
          </div>
          <Link
            href="/match"
            className="group inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-xl bg-band px-5 font-semibold text-white transition-colors hover:bg-band-line"
          >
            {t("matchStart")}
            <Icon name="arrow-right" className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* School list — visible straight away, no search needed */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="page-title">{t("directoryTitle")}</h2>
            <p className="mt-2 max-w-2xl text-muted">{t("directoryDescription")}</p>
          </div>
          {totalSchools > 0 && (
            <Link href="/search" className="btn-secondary shrink-0">
              {t("viewAll", { count: totalSchools })}
              <Icon name="arrow-right" className="size-4" />
            </Link>
          )}
        </div>

        {schools.length > 0 ? (
          <ul className="mt-6 space-y-3">
            {schools.map((school) => (
              <li key={school.id}>
                <SchoolCard school={school} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6">
            <EmptyState icon="search" title={t("noSchools")} />
          </div>
        )}
      </section>

      {/* Where the schools are: districts as a list, and the map beside it. */}
      {(districts.length > 0 || pinned.length > 0) && (
        <section className="reveal mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="page-title">{tMap("homeTitle")}</h2>
              <p className="mt-2 max-w-2xl text-muted">{tMap("homeDescription")}</p>
            </div>
            {pinned.length > 0 && (
              <Link href="/map" className="btn-secondary shrink-0">
                {tMap("openFull")}
                <Icon name="arrow-right" className="size-4" />
              </Link>
            )}
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]">
            {districts.length > 0 && (
              <nav aria-labelledby="district-title" className="plate p-3 lg:self-start">
                <h3 id="district-title" className="label px-2 pb-1 pt-1.5">
                  {t("byDistrict")}
                </h3>
                <ul>
                  {districts.map(({ name, count }) => (
                    <li key={name}>
                      <Link
                        href={`/search?district=${encodeURIComponent(name)}`}
                        className="group grid min-h-11 grid-cols-[minmax(0,1fr)_5rem_2rem] items-center gap-3 rounded-lg px-2 transition-colors hover:bg-surface-muted"
                      >
                        <span className="truncate font-semibold text-foreground group-hover:underline group-hover:underline-offset-4">
                          {placeName(tPlace, name)}
                        </span>
                        {/* How many schools, as a share of the busiest district. */}
                        <span aria-hidden className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                          <span
                            className="block h-full rounded-full bg-accent"
                            style={{ width: `${(count / mostInDistrict) * 100}%` }}
                          />
                        </span>
                        <span className="text-right text-sm font-semibold tabular-nums text-muted">{count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            {pinned.length > 0 && <LazyMap schools={pinned} height={440} />}
          </div>
        </section>
      )}

      {/* Recent reviews — only once there are some */}
      {recentReviews.length > 0 && (
        <section className="reveal mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
          <h2 className="page-title">{t("recentlyReviewed")}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {recentReviews.map((review) => (
              <article key={review.id} className="plate flex flex-col p-5">
                <Stars value={reviewAverage(review.rating)} className="text-base" />
                <p className="mt-3 line-clamp-4 leading-7 text-foreground">“{review.bodyText}”</p>
                <div className="mt-auto pt-4 text-sm">
                  <Link href={`/school/${review.school.id}/reviews`} className="link">
                    {schoolNames(review.school, locale).primary}
                  </Link>
                  <p className="mt-0.5 text-xs text-subtle">
                    {tRole(review.user.role)}, {format.dateTime(review.createdAt, { dateStyle: "long" })}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Call to action */}
      <section className="reveal mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
        <div className="plate flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-foreground sm:text-[1.75rem]">
              {t("ctaTitle")}
            </h2>
            <p className="mt-1.5 text-pretty leading-7 text-muted">{t("ctaBody")}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link href="/search" className="btn-primary">
              {t("ctaFind")}
            </Link>
            <Link href="/register" className="btn-secondary">
              {tCommon("signUp")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
