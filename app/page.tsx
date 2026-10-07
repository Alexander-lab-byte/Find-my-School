import Link from "next/link";
import type { SchoolType } from "@prisma/client";
import { getHomepageData } from "@/lib/schools";
import { reviewAverage } from "@/lib/ratings";
import { ROLE_LABELS, TYPE_DESCRIPTIONS, TYPE_LABELS, formatDate } from "@/lib/labels";
import { HeroSearchBar } from "@/components/search/HeroSearchBar";
import { SchoolCard } from "@/components/search/SchoolCard";
import { Icon, type IconName } from "@/components/common/Icon";
import { Stars } from "@/components/common/StarRating";

const QUICK_LINKS: [label: string, href: string][] = [
  ["Public", "/search?type=PUBLIC"],
  ["Private", "/search?type=PRIVATE"],
  ["International", "/search?type=INTERNATIONAL"],
  ["High school", "/search?level=HIGH"],
  ["With dormitory", "/search?dorm=true"],
];

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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export default async function Home() {
  const { schools, totalSchools, typeCounts, districts, recentReviews } = await getHomepageData();

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line bg-surface">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,var(--accent-soft),transparent)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Schools across Mongolia
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-balance font-display text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Choose a school with confidence
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-8 text-muted">
            Compare curricula, fees, and dormitories, and read honest reviews from parents,
            students, alumni, and educators.
          </p>

          <div className="mt-9 flex justify-center">
            <HeroSearchBar />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="mr-1 text-subtle">Browse:</span>
            {QUICK_LINKS.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-muted transition-colors hover:border-accent/40 hover:text-accent"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* School list — visible straight away, no search needed */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <SectionHeading
          eyebrow="Directory"
          title="Schools on Find My School"
          description="Sorted by community rating. Open any school for its full profile, fees, and reviews."
          action={
            totalSchools > 0 && (
              <Link
                href="/search"
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-accent hover:underline hover:underline-offset-4"
              >
                View all {totalSchools} {totalSchools === 1 ? "school" : "schools"}
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
          <p className="mt-8 rounded-xl border border-dashed border-line-strong p-10 text-center text-muted">
            No schools have been added yet.
          </p>
        )}
      </section>

      {/* Browse by type & district */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <SectionHeading
            eyebrow="Browse"
            title="Find the right kind of school"
            description="Start broad, then narrow down by level, curriculum, and features."
          />

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {(Object.keys(TYPE_LABELS) as SchoolType[]).map((type) => {
              const count = typeCounts[type] ?? 0;
              return (
                <Link
                  key={type}
                  href={`/search?type=${type}`}
                  className="group rounded-xl border border-line bg-background p-6 transition hover:border-line-strong hover:shadow-[0_12px_28px_-18px_rgb(0_0_0/0.25)]"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <Icon name={TYPE_ICONS[type]} className="size-5" />
                  </span>
                  <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
                    {TYPE_LABELS[type]} schools
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{TYPE_DESCRIPTIONS[type]}</p>
                  <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-accent">
                    {count} {count === 1 ? "school" : "schools"}
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
              <h3 className="text-sm font-semibold text-foreground">By district</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {districts.map(({ name, count }) => (
                  <Link
                    key={name}
                    href={`/search?district=${encodeURIComponent(name)}`}
                    className="flex items-center gap-2 rounded-full border border-line bg-background px-3.5 py-1.5 text-sm text-muted transition-colors hover:border-accent/40 hover:text-accent"
                  >
                    {name}
                    <span className="text-xs tabular-nums text-subtle">{count}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Recent reviews — only once there are some */}
      {recentReviews.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <SectionHeading eyebrow="Community" title="Recently reviewed" />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {recentReviews.map((review) => (
              <article
                key={review.id}
                className="flex flex-col rounded-xl border border-line bg-surface p-6"
              >
                <Stars value={reviewAverage(review.rating)} className="text-base" />
                <p className="mt-3 line-clamp-4 text-sm leading-6 text-foreground">
                  “{review.bodyText}”
                </p>
                <div className="mt-auto pt-5 text-sm">
                  <Link
                    href={`/school/${review.school.id}/reviews`}
                    className="font-medium text-accent hover:underline hover:underline-offset-4"
                  >
                    {review.school.nameEn}
                  </Link>
                  <p className="mt-0.5 text-xs text-subtle">
                    {ROLE_LABELS[review.user.role]} · {formatDate(review.createdAt)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Call to action */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="relative overflow-hidden rounded-2xl bg-accent px-6 py-12 text-center text-accent-foreground sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/5"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-white/5"
          />
          <Icon name="message" className="relative mx-auto size-8 opacity-80" />
          <h2 className="relative mx-auto mt-4 max-w-xl text-balance font-display text-3xl font-semibold tracking-tight">
            Know a school well?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-pretty leading-7 opacity-85">
            Your review helps another family make one of the most important decisions they face.
            It takes about three minutes.
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent-foreground px-5 py-2.5 text-sm font-medium text-accent transition-opacity hover:opacity-90"
            >
              Find your school to review
              <Icon name="arrow-right" className="size-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg border border-current/30 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
            >
              Create a free account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
