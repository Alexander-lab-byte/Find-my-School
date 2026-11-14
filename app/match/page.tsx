import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { getDistricts, listAllSchools } from "@/lib/schools";
import { budgetFilter, parseMatchAnswers, rankSchools, type MatchAnswers, type MatchReason } from "@/lib/match";
import { formatLocation, schoolNames, tuitionSummary } from "@/lib/labels";
import { roundLocation } from "@/lib/geo";
import { MatchQuiz } from "@/components/match/MatchQuiz";
import { Badge, TYPE_FILL } from "@/components/common/Badge";
import { Icon } from "@/components/common/Icon";
import { SchoolMonogram } from "@/components/common/SchoolMonogram";
import { EmptyState } from "@/components/common/EmptyState";
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
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="page-title">{t("title")}</h1>
        <p className="mt-2 text-muted">{t("intro")}</p>
        <div className="plate mt-7 p-5 sm:p-8">
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
  const tCurriculum = await getTranslations("CurriculumShort");
  const reasonText = (reason: MatchReason) => {
    if (!tReason.has(reason.key)) return reason.key;
    const curricula = reason.curricula?.map((c) => tCurriculum(c)).join(", ");
    return tReason(reason.key, curricula ? { ...reason.values, curricula } : reason.values);
  };

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
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="page-title">
        {ranked.length > 0 ? t("resultsTitle", { count: ranked.length }) : t("noneTitle")}
      </h1>
      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={t("yourAnswers")}>
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

      <div className="mt-8">
        {ranked.length === 0 ? (
          <EmptyState icon="search" title={t("noneTitle")} body={t("noneBody")}>
            <Link href={editHref(params)} className="btn-primary">
              {t("changeAnswers")}
            </Link>
          </EmptyState>
        ) : (
          // The ranking drawn as a route: one numbered stop per school, best fit first.
          <ol className="relative space-y-3 sm:before:absolute sm:before:bottom-8 sm:before:left-[1.125rem] sm:before:top-8 sm:before:w-1 sm:before:-translate-x-1/2 sm:before:rounded-full sm:before:bg-line-strong">
            {shown.map(({ school, percent, reasons, cautions }, index) => {
              const { primary, secondary } = schoolNames(school, locale);
              const best = index === 0;
              return (
                <li key={school.id} className="relative sm:pl-14">
                  <span
                    aria-hidden
                    className={`absolute left-0 top-5 hidden size-9 items-center justify-center rounded-full border-[3px] font-display text-sm font-bold tabular-nums sm:flex ${
                      best
                        ? "border-gold-foreground/60 bg-gold text-gold-foreground"
                        : "border-line-strong bg-surface text-foreground"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <article className="plate plate-link group relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-4 overflow-hidden p-4 pl-5 sm:p-5 sm:pl-6">
                    <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${TYPE_FILL[school.type]}`} />
                    <SchoolMonogram name={school.nameEn} type={school.type} logoUrl={school.logoUrl} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                        <div className="min-w-0">
                          <h2 className="font-display text-[1.0625rem] font-semibold leading-snug text-foreground">
                            <Link
                              href={`/school/${school.id}`}
                              className="after:absolute after:inset-0 after:rounded-2xl after:content-[''] group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4"
                            >
                              <span className="sm:hidden">{index + 1}. </span>
                              {primary}
                            </Link>
                          </h2>
                          {secondary && <p className="text-sm text-muted">{secondary}</p>}
                        </div>
                        {/* How good the fit is: the number, and the same number as a bar. */}
                        <div className="w-28 shrink-0" title={t("percentHint")}>
                          <p
                            className={`inline-block rounded-md px-2 py-1 font-display text-sm font-bold tabular-nums ${
                              best ? "bg-gold text-gold-foreground" : "bg-gold-soft text-foreground"
                            }`}
                          >
                            {t("percent", { percent })}
                          </p>
                          <span aria-hidden className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-surface-muted">
                            <span className="block h-full rounded-full bg-gold" style={{ width: `${percent}%` }} />
                          </span>
                        </div>
                      </div>
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                        <span className="font-medium text-foreground">{tType(school.type)}</span>
                        <span>{formatLocation(tPlace, school)}</span>
                        <span className="font-display font-semibold tabular-nums text-foreground">
                          {tuitionSummary(tTuition, school.type, school.tuitionMinAnnual, school.tuitionMaxAnnual)}
                        </span>
                      </p>
                      {reasons.length > 0 && (
                        <ul className="mt-3 space-y-1.5 text-sm">
                          {reasons.map((reason) => (
                            <li key={reason.key} className="flex items-start gap-2 text-foreground">
                              <Icon name="check" className="mt-1 size-4 shrink-0 text-ok" strokeWidth={2.5} />
                              {reasonText(reason)}
                            </li>
                          ))}
                        </ul>
                      )}
                      {cautions.length > 0 && (
                        <ul className="mt-2 space-y-1.5 text-sm">
                          {cautions.map((reason) => (
                            <li key={reason.key} className="flex items-start gap-2 text-muted">
                              <Icon name="info" className="mt-1 size-4 shrink-0 text-subtle" />
                              {reasonText(reason)}
                            </li>
                          ))}
                        </ul>
                      )}
                      {/* Above the stretched link, so ticking it doesn't open the school. */}
                      <div className="mt-4">
                        <CompareCheckbox schoolId={school.id} />
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        )}

        <p className="mt-8 max-w-2xl text-sm leading-6 text-muted">{t("howItWorks")}</p>
      </div>
    </main>
  );
}
