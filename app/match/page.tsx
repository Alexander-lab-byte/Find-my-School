import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { getDistricts, listAllSchools } from "@/lib/schools";
import { budgetFilter, parseMatchAnswers, rankSchools, type MatchAnswers, type MatchReason } from "@/lib/match";
import { formatLocation, schoolNames, tuitionSummary } from "@/lib/labels";
import { roundLocation } from "@/lib/geo";
import { MatchQuiz } from "@/components/match/MatchQuiz";
import { Badge, TYPE_TONE } from "@/components/common/Badge";
import { Icon } from "@/components/common/Icon";
import { SchoolMonogram } from "@/components/common/SchoolMonogram";
import { SkyClouds } from "@/components/common/SkyClouds";
import { CompareCheckbox } from "@/components/compare/CompareCheckbox";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Match");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

type MatchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** How many ranked schools to show. The rest are one click away in search. */
const SHOW = 10;

/** The same answers as search filters, for "See all in search". */
function searchHref(answers: MatchAnswers) {
  const qs = new URLSearchParams({ level: answers.level });
  const budget = budgetFilter(answers.budget);
  if (budget) qs.set("budget", budget);
  if (answers.dorm) qs.set("dorm", "true");
  if (answers.near) {
    qs.set("near", roundLocation(answers.near));
    qs.set("sort", "distance");
  } else if (answers.district) {
    qs.set("district", answers.district);
  }
  return `/search?${qs.toString()}`;
}

function editHref(params: Record<string, string | string[] | undefined>) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") qs.set(key, value);
  }
  qs.set("edit", "1");
  return `/match?${qs.toString()}`;
}

export default async function MatchPage({ searchParams }: MatchPageProps) {
  const params = await searchParams;
  const answers = parseMatchAnswers(params);
  const editing = params.edit === "1";
  const t = await getTranslations("Match");

  if (!answers || editing) {
    const districts = await getDistricts();
    return (
      <main>
        <div className="relative isolate">
          <SkyClouds />
          <div className="mx-auto max-w-6xl px-4 pb-4 pt-10 text-center sm:px-6">
            <p className="eyebrow">{t("eyebrow")}</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("title")}
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-muted">{t("intro")}</p>
          </div>
        </div>
        <div className="px-4 pb-20 pt-6 sm:px-6">
          <MatchQuiz districts={districts} />
        </div>
      </main>
    );
  }

  const schools = await listAllSchools({
    level: answers.level,
    budget: budgetFilter(answers.budget),
    dorm: answers.dorm,
  });
  const ranked = rankSchools(schools, answers);
  const shown = ranked.slice(0, SHOW);

  const locale = await getLocale();
  const tReason = await getTranslations("MatchReason");
  const tType = await getTranslations("SchoolType");
  const tTuition = await getTranslations("Tuition");
  const tPlace = await getTranslations("Place");
  const reasonText = (reason: MatchReason) =>
    tReason.has(reason.key) ? tReason(reason.key, reason.values) : reason.key;

  // A short summary of what they asked for, so the results make sense.
  const summary = [
    t(`level.${answers.level}`),
    t(`budget.${answers.budget}`),
    t(`goal.${answers.goal}`),
    answers.dorm && t("summaryDorm"),
    answers.near
      ? t("summaryNear")
      : answers.district && (tPlace.has(answers.district) ? tPlace(answers.district) : answers.district),
  ].filter(Boolean) as string[];

  return (
    <main>
      <div className="relative isolate">
        <SkyClouds />
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {ranked.length > 0 ? t("resultsTitle", { count: ranked.length }) : t("noneTitle")}
          </h1>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label={t("yourAnswers")}>
            {summary.map((item) => (
              <li key={item}>
                <Badge>{item}</Badge>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={editHref(params)} className="btn-secondary">
              <Icon name="pencil" className="size-4" />
              {t("changeAnswers")}
            </Link>
            {ranked.length > SHOW && (
              <Link href={searchHref(answers)} className="btn-secondary">
                {t("seeAllInSearch", { count: ranked.length })}
                <Icon name="arrow-right" className="size-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        {ranked.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
            <p className="mx-auto max-w-md text-muted">{t("noneBody")}</p>
            <Link href={editHref(params)} className="btn-primary mt-6">
              {t("changeAnswers")}
            </Link>
          </div>
        ) : (
          <ol className="space-y-4">
            {shown.map(({ school, percent, reasons, cautions }, index) => {
              const { primary, secondary } = schoolNames(school, locale);
              return (
                <li
                  key={school.id}
                  className="lift reveal relative rounded-[1.75rem] border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6"
                >
                  <div className="flex items-start gap-4">
                    <span className="hidden font-display text-2xl font-bold tabular-nums text-subtle sm:block">
                      {index + 1}
                    </span>
                    <SchoolMonogram name={school.nameEn} type={school.type} logoUrl={school.logoUrl} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h2 className="font-display text-lg font-bold leading-snug text-foreground">
                            <Link
                              href={`/school/${school.id}`}
                              className="after:absolute after:inset-0 after:rounded-[1.75rem] after:content-[''] hover:text-accent"
                            >
                              {primary}
                            </Link>
                          </h2>
                          {secondary && <p className="text-sm text-muted">{secondary}</p>}
                        </div>
                        <span
                          className="shrink-0 rounded-full bg-accent-soft px-3 py-1 text-sm font-bold tabular-nums text-accent"
                          title={t("percentHint")}
                        >
                          {t("percent", { percent })}
                        </span>
                      </div>

                      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                        <Badge tone={TYPE_TONE[school.type]}>{tType(school.type)}</Badge>
                        <span>{formatLocation(tPlace, school)}</span>
                        <span className="font-medium text-foreground">
                          {tuitionSummary(tTuition, school.type, school.tuitionMinAnnual, school.tuitionMaxAnnual)}
                        </span>
                      </p>

                      {reasons.length > 0 && (
                        <ul className="mt-4 space-y-1.5 text-sm">
                          {reasons.map((reason) => (
                            <li key={reason.key} className="flex items-start gap-2 text-foreground">
                              <Icon name="check" className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                              {reasonText(reason)}
                            </li>
                          ))}
                        </ul>
                      )}
                      {cautions.length > 0 && (
                        <ul className="mt-2 space-y-1.5 text-sm">
                          {cautions.map((reason) => (
                            <li key={reason.key} className="flex items-start gap-2 text-muted">
                              <Icon name="info" className="mt-0.5 size-4 shrink-0 text-subtle" />
                              {reasonText(reason)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  {/* Above the stretched link, so ticking it doesn't open the school. */}
                  <div className="relative z-10 mt-4 flex justify-end">
                    <CompareCheckbox schoolId={school.id} />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        <p className="mt-8 text-center text-xs leading-5 text-subtle">{t("howItWorks")}</p>
      </div>
    </main>
  );
}
