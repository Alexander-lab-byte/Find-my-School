import { notFound } from "next/navigation";
import { getSchoolAdmissions } from "@/lib/schools";
import { formatTuition } from "@/lib/labels";

export default async function SchoolAdmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const school = await getSchoolAdmissions(id);

  if (!school) notFound();

  return (
    <div className="space-y-8">
      <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-zinc-500">Tuition</dt>
          <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
            {school.type === "PUBLIC"
              ? "Free (public school)"
              : formatTuition(school.tuitionMinAnnual, school.tuitionMaxAnnual)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-zinc-500">Application deadline</dt>
          <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
            {school.applicationDeadline
              ? new Date(school.applicationDeadline).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Rolling / not specified"}
          </dd>
        </div>
      </dl>

      <section>
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Entrance requirements
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {school.entranceExamInfo ?? "No entrance exam information has been added yet."}
        </p>
      </section>

      {school.type === "PUBLIC" && (
        <section>
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Catchment area
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {school.catchmentAreaInfo ?? "No catchment area information has been added yet."}
          </p>
        </section>
      )}
    </div>
  );
}
