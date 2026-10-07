import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RemoveFromCompare } from "@/components/compare/RemoveFromCompare";
import { CURRICULUM_LABELS, LEVEL_LABELS, TYPE_LABELS, formatTuition } from "@/lib/labels";

const MAX_COMPARE = 3;

const LANGUAGE_NAMES: Record<string, string> = {
  mn: "Mongolian",
  en: "English",
  ru: "Russian",
  zh: "Chinese",
  ko: "Korean",
  ja: "Japanese",
};

export const metadata = { title: "Compare schools" };

type ComparePageProps = { searchParams: Promise<{ ids?: string }> };

const dash = <span className="text-zinc-400">—</span>;
const orDash = (value?: string | null) => (value ? value : dash);

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const { ids: idsParam } = await searchParams;
  const ids = [...new Set((idsParam ?? "").split(",").map((s) => s.trim()).filter(Boolean))].slice(
    0,
    MAX_COMPARE,
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

  type School = (typeof found)[number];
  type Row = { label: string; cell: (s: School) => ReactNode };

  const schools = ids
    .map((id) => found.find((s) => s.id === id))
    .filter((s): s is School => Boolean(s));
  const remainingIdsWithout = (id: string) => schools.map((s) => s.id).filter((x) => x !== id);

  const ratingRow = (label: string, pick: (s: School) => number | null): Row => ({
    label,
    cell: (s) => {
      const value = pick(s);
      if (!value) return dash;
      const best =
        schools.length > 1 && value === Math.max(...schools.map((x) => pick(x) ?? 0));
      return (
        <span className={best ? "font-semibold text-accent" : ""}>
          {value.toFixed(1)} <span className="text-amber-500">★</span>
        </span>
      );
    },
  });

  const sections: { title: string; rows: Row[] }[] = [
    {
      title: "Basics",
      rows: [
        { label: "Type", cell: (s) => TYPE_LABELS[s.type] },
        { label: "Level", cell: (s) => LEVEL_LABELS[s.level] },
        {
          label: "Location",
          cell: (s) =>
            orDash(
              [s.khoroo && `Khoroo ${s.khoroo}`, s.district, s.aimagCity].filter(Boolean).join(", "),
            ),
        },
        {
          label: "Curriculum",
          cell: (s) => orDash(s.curriculum.map((c) => CURRICULUM_LABELS[c]).join(", ")),
        },
        {
          label: "Languages",
          cell: (s) =>
            orDash(
              s.teachingLanguages.map((l) => LANGUAGE_NAMES[l] ?? l.toUpperCase()).join(", "),
            ),
        },
        { label: "Student–teacher ratio", cell: (s) => orDash(s.studentTeacherRatio) },
        { label: "Accreditation", cell: (s) => orDash(s.accreditation) },
      ],
    },
    {
      title: "Admissions & cost",
      rows: [
        {
          label: "Tuition",
          cell: (s) =>
            s.tuitionMinAnnual || s.tuitionMaxAnnual
              ? formatTuition(s.tuitionMinAnnual, s.tuitionMaxAnnual)
              : s.type === "PUBLIC"
                ? "Free (public school)"
                : "Not listed",
        },
        {
          label: "Application deadline",
          cell: (s) =>
            s.applicationDeadline
              ? s.applicationDeadline.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : dash,
        },
        { label: "Dormitory", cell: (s) => (s.dormitory ? "Available" : "None listed") },
      ],
    },
    {
      title: "Ratings",
      rows: [
        ratingRow("Overall", (s) => s.avgOverall),
        ratingRow("Academics", (s) => s.avgAcademics),
        ratingRow("Facilities", (s) => s.avgFacilities),
        ratingRow("Dorms", (s) => s.avgDorms),
        ratingRow("Library", (s) => s.avgLibrary),
        ratingRow("Teachers", (s) => s.avgTeachers),
        ratingRow("Environment", (s) => s.avgEnvironment),
        { label: "Reviews", cell: (s) => s.reviewCount },
      ],
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
        Compare schools
      </h1>

      {schools.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-card)] border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
          <p className="text-zinc-600 dark:text-zinc-400">You haven&apos;t picked any schools to compare yet.</p>
          <Link
            href="/search"
            className="mt-2 inline-block text-sm text-accent underline underline-offset-4"
          >
            Browse schools
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-zinc-500">
            {schools.length === 1
              ? "Add at least one more school to see them side by side."
              : "The best score in each rating row is highlighted."}
          </p>

          <div className="mt-6 overflow-x-auto rounded-[var(--radius-card)] border border-zinc-200 dark:border-zinc-800">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead>
                <tr>
                  <td className="sticky left-0 w-36 bg-background p-4" />
                  {schools.map((s) => (
                    <th key={s.id} scope="col" className="p-4 align-top font-normal">
                      <Link
                        href={`/school/${s.id}`}
                        className="font-medium text-zinc-900 hover:text-accent dark:text-zinc-100"
                      >
                        {s.nameEn}
                      </Link>
                      <div className="text-zinc-500">{s.nameMn}</div>
                      <RemoveFromCompare id={s.id} remainingIds={remainingIdsWithout(s.id)} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sections.map((section) => (
                  <Fragment key={section.title}>
                    <tr>
                      <th
                        colSpan={schools.length + 1}
                        scope="colgroup"
                        className="bg-accent/[0.06] px-4 py-2 text-left text-xs font-medium text-zinc-500"
                      >
                        {section.title}
                      </th>
                    </tr>
                    {section.rows.map((row) => (
                      <tr key={row.label} className="border-t border-zinc-200 dark:border-zinc-800">
                        <th
                          scope="row"
                          className="sticky left-0 bg-background p-4 text-left font-medium text-zinc-600 dark:text-zinc-400"
                        >
                          {row.label}
                        </th>
                        {schools.map((s) => (
                          <td key={s.id} className="p-4 text-zinc-900 dark:text-zinc-100">
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
              className="mt-4 inline-block text-sm text-accent underline underline-offset-4"
            >
              Add another school (up to {MAX_COMPARE})
            </Link>
          )}
        </>
      )}
    </div>
  );
}
