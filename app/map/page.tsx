import { prisma } from "@/lib/prisma";
import { SchoolMapLoader } from "@/components/map/SchoolMapLoader";
import type { MapSchool } from "@/components/map/SchoolMap";

export const metadata = { title: "Map of schools" };

export default async function MapPage() {
  const [rows, total] = await Promise.all([
    prisma.school.findMany({
      where: { latitude: { not: null }, longitude: { not: null } },
      orderBy: { nameEn: "asc" },
      select: {
        id: true,
        nameEn: true,
        nameMn: true,
        type: true,
        level: true,
        district: true,
        avgOverall: true,
        reviewCount: true,
        latitude: true,
        longitude: true,
      },
    }),
    prisma.school.count(),
  ]);

  const schools = rows.flatMap<MapSchool>((s) =>
    s.latitude != null && s.longitude != null
      ? [{ ...s, latitude: s.latitude, longitude: s.longitude }]
      : [],
  );
  const missing = total - schools.length;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
        Map of schools
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        {schools.length} {schools.length === 1 ? "school" : "schools"} shown
        {missing > 0 ? ` · ${missing} without a location yet` : ""}. Tap a dot for details.
      </p>

      <div className="mt-6">
        <SchoolMapLoader schools={schools} />
      </div>
    </div>
  );
}
