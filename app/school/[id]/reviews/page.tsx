import { notFound } from "next/navigation";
import { getSchoolHeader } from "@/lib/schools";

export default async function SchoolReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const school = await getSchoolHeader(id);

  if (!school) notFound();

  return (
    <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
      Reviews for {school.nameEn} are coming soon — this is next on the build list.
    </div>
  );
}
