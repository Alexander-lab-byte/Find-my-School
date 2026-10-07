import { notFound } from "next/navigation";
import { getSchoolFacilities } from "@/lib/schools";
import { StarRating } from "@/components/common/StarRating";

export default async function SchoolFacilitiesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const school = await getSchoolFacilities(id);

  if (!school) notFound();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Facilities overall</span>
          <StarRating value={school.avgFacilities} size="sm" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Library</span>
          <StarRating value={school.avgLibrary} size="sm" />
        </div>
      </div>

      {school.facilities.length === 0 ? (
        <p className="text-zinc-500">
          No facility details have been added for this school yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {school.facilities.map((facility) => (
            <div
              key={facility.id}
              className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="text-xs text-zinc-500">{facility.category}</div>
              <div className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
                {facility.nameEn}
              </div>
              {facility.description && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {facility.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
