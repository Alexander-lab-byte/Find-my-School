import { notFound } from "next/navigation";
import { getSchoolOverview } from "@/lib/schools";
import { Badge } from "@/components/common/Badge";
import { StarRating } from "@/components/common/StarRating";
import { CURRICULUM_LABELS } from "@/lib/labels";

const LANGUAGE_LABELS: Record<string, string> = {
  mn: "Mongolian",
  en: "English",
  ru: "Russian",
};

export default async function SchoolOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const school = await getSchoolOverview(id);

  if (!school) notFound();

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Curriculum & instruction
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {school.curriculum.map((c) => (
            <Badge key={c} tone="accent">
              {CURRICULUM_LABELS[c]}
            </Badge>
          ))}
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-zinc-500">Teaching languages</dt>
            <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
              {school.teachingLanguages.map((l) => LANGUAGE_LABELS[l] ?? l).join(", ")}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500">Student-teacher ratio</dt>
            <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
              {school.studentTeacherRatio ?? "Not reported"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm text-zinc-500">Accreditation</dt>
            <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
              {school.accreditation ?? "Not reported"}
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Community ratings
        </h2>
        <div className="mt-3 space-y-2">
          <RatingRow label="Academics" value={school.avgAcademics} />
          <RatingRow label="Teachers" value={school.avgTeachers} />
          <RatingRow label="Campus environment" value={school.avgEnvironment} />
        </div>
      </section>
    </div>
  );
}

function RatingRow({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-2 dark:border-zinc-800">
      <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
      <StarRating value={value} size="sm" />
    </div>
  );
}
