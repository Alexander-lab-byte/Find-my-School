import { Fragment, type ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatLocation, schoolNames, tuitionSummary } from "@/lib/labels";
import { MAX_COMPARE } from "@/lib/compare";
import { RemoveFromCompare } from "@/components/compare/RemoveFromCompare";
import { Icon } from "@/components/common/Icon";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Compare");
  return { title: t("title") };
}

type ComparePageProps = { searchParams: Promise<{ ids?: string }> };

const dash = <span className="text-subtle">—</span>;
const orDash = (value?: string | null) => (value ? value : dash);

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const { ids: idsParam } = await searchParams;
  const ids = [...new Set((idsParam ?? "").split(",").map((s) => s.trim()).filter(Boolean))].slice(
    0,
    MAX_COMPARE
  );

  const found = ids.length
    ? await prisma.school.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          nameEn: true,
          nameMn: true,
          schoolNumber: true,
          type: true,
          level: true,
          curriculum: true,
          teachingLanguages: true,
          aimagCity: true,
          district: true,
          khoroo: true,
          studentTeacherRatio: true,
          accreditation: true,
          foundedYear: true,
          tuitionMinAnnual: true,
          tuitionMaxAnnual: true,
          applicationDeadline: true,
          reviewCount: true,
          avgOverall: true,
          avgAcademics: true,
          avgFacilities: true,
          avgDorms: true,
          avgLibrary: true,
          avgTeachers: true,
          avgEnvironment: true,
          dormitory: { select: { id: true } },
        },
      })
    : [];

  const t = await getTranslations("Compare");
  const tCommon = await getTranslations("Common");
  const tType = await getTranslations("SchoolType");
  const tLevel = await getTranslations("Level");
  const tCurriculum = await getTranslations("Curriculum");
  const tLanguage = await getTranslations("Language");
  const tTuition = await getTranslations("Tuition");
  const tRatings = await getTranslations("Ratings");
  const tPlace = await getTranslations("Place");
  const format = await getFormatter();
  const locale = await getLocale();

  type School = (typeof found)[number];
  type Row = { label: string; cell: (s: School) => ReactNode };

  // Keep the order the visitor picked them in.
  const schools = ids
    .map((id) => found.find((s) => s.id === id))
    .filter((s): s is School => Boolean(s));
  const remainingIdsWithout = (id: string) => schools.map((s) => s.id).filter((x) => x !== id);

  const ratingRow = (label: string, pick: (s: School) => number | null): Row => ({
    label,
    cell: (s) => {
      const value = pick(s);
      if (!value) return dash;
      const best = schools.length > 1 && value === Math.max(...schools.map((x) => pick(x) ?? 0));
      return (
        <span className={`inline-flex items-center gap-1 ${best ? "font-semibold text-accent" : ""}`}>
          {value.toFixed(1)}
          <span className="text-star" aria-hidden>
            ★
          </span>
        </span>
      );
    },
  });

  const sections: { title: string; rows: Row[] }[] = [
    {
      title: t("basics"),
      rows: [
        { label: t("type"), cell: (s) => tType(s.type) },
        { label: t("level"), cell: (s) => tLevel(s.level) },
        { label: t("location"), cell: (s) => orDash(formatLocation(tPlace, s)) },
        {
          label: t("curriculum"),
          cell: (s) => orDash(s.curriculum.map((c) => tCurriculum(c)).join(", ")),
        },
        {
          label: t("languages"),
          cell: (s) =>
            orDash(
              s.teachingLanguages
                .map((l) => (tLanguage.has(l) ? tLanguage(l) : l.toUpperCase()))
                .join(", ")
            ),
        },
        { label: t("founded"), cell: (s) => (s.foundedYear ? String(s.foundedYear) : dash) },
        { label: t("ratio"), cell: (s) => orDash(s.studentTeacherRatio) },
        { label: t("accreditation"), cell: (s) => orDash(s.accreditation) },
      ],
    },
    {
      title: t("admissions"),
      rows: [
        {
          label: t("tuition"),
          cell: (s) => tuitionSummary(tTuition, s.type, s.tuitionMinAnnual, s.tuitionMaxAnnual),
        },
        {
          label: t("deadline"),
          cell: (s) =>
            s.applicationDeadline ? format.dateTime(s.applicationDeadline, { dateStyle: "medium" }) : dash,
        },
        { label: t("dormitory"), cell: (s) => (s.dormitory ? t("available") : t("none")) },
      ],
    },
    {
      title: t("ratings"),
      rows: [
        ratingRow(t("overall"), (s) => s.avgOverall),
        ratingRow(tRatings("academics"), (s) => s.avgAcademics),
        ratingRow(tRatings("teachers"), (s) => s.avgTeachers),
        ratingRow(tRatings("facilities"), (s) => s.avgFacilities),
        ratingRow(tRatings("environment"), (s) => s.avgEnvironment),
        ratingRow(tRatings("library"), (s) => s.avgLibrary),
        ratingRow(tRatings("dorms"), (s) => s.avgDorms),
        { label: t("reviews"), cell: (s) => s.reviewCount },
      ],
    },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{t("eyebrow")}</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {t("title")}
      </h1>

      {schools.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-muted text-subtle">
            <Icon name="columns" className="size-5" />
          </span>
          <h2 className="mt-4 font-display text-xl font-semibold text-foreground">{t("emptyTitle")}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">{t("emptyBody", { max: MAX_COMPARE })}</p>
          <Link
            href="/search"
            className="mt-6 inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            {tCommon("browseSchools")}
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-2 text-muted">
            {schools.length === 1 ? t("addOneMore") : t("bestHighlighted")}
          </p>

          <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-surface">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead>
                <tr>
                  <td className="sticky left-0 w-44 bg-surface p-4" />
                  {schools.map((s) => {
                    const { primary, secondary } = schoolNames(s, locale);
                    return (
                      <th key={s.id} scope="col" className="p-4 align-top font-normal">
                        <Link
                          href={`/school/${s.id}`}
                          className="font-display text-base font-semibold text-foreground hover:text-accent"
                        >
                          {primary}
                        </Link>
                        {secondary && <div className="mt-0.5 text-xs text-muted">{secondary}</div>}
                        <RemoveFromCompare id={s.id} remainingIds={remainingIdsWithout(s.id)} />
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sections.map((section) => (
                  <Fragment key={section.title}>
                    <tr>
                      <th
                        colSpan={schools.length + 1}
                        scope="colgroup"
                        className="bg-surface-muted px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-subtle"
                      >
                        {section.title}
                      </th>
                    </tr>
                    {section.rows.map((row) => (
                      <tr key={row.label} className="border-t border-line">
                        <th
                          scope="row"
                          className="sticky left-0 bg-surface p-4 text-left font-medium text-muted"
                        >
                          {row.label}
                        </th>
                        {schools.map((s) => (
                          <td key={s.id} className="p-4 text-foreground">
                            {row.cell(s)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {schools.length < MAX_COMPARE && (
            <Link
              href="/search"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline hover:underline-offset-4"
            >
              {t("addAnother", { max: MAX_COMPARE })}
              <Icon name="arrow-right" className="size-4" />
            </Link>
          )}
        </>
      )}
    </main>
  );
}
