import { notFound } from "next/navigation";
import { getSchoolDormitory } from "@/lib/schools";
import { StarRating } from "@/components/common/StarRating";

export default async function SchoolDormitoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const school = await getSchoolDormitory(id);

  if (!school) notFound();

  if (!school.dormitory) {
    return (
      <p className="text-zinc-500">This school does not offer on-campus dormitory housing.</p>
    );
  }

  const dorm = school.dormitory;

  return (
    <div className="space-y-8">
      <StarRating value={school.avgDorms} size="md" />

      <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-zinc-500">Room capacity</dt>
          <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
            {dorm.roomCapacity ? `${dorm.roomCapacity} students per room` : "Not reported"}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-zinc-500">Monthly fee</dt>
          <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
            {dorm.monthlyFeeAmount ? `₮${dorm.monthlyFeeAmount.toLocaleString()} / month` : "Not reported"}
          </dd>
        </div>
      </dl>

      {dorm.livingConditions && (
        <section>
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Living conditions
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">{dorm.livingConditions}</p>
        </section>
      )}

      {dorm.boardingRules && (
        <section>
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Boarding rules
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">{dorm.boardingRules}</p>
        </section>
      )}

      {dorm.safetyInfo && (
        <section>
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Safety</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">{dorm.safetyInfo}</p>
        </section>
      )}
    </div>
  );
}
