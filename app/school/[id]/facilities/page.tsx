import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSchoolFacilities } from "@/lib/schools";
import { StarRating } from "@/components/common/StarRating";
import { EmptyNote, ProfileSection } from "@/components/school-profile/ProfileSection";

export default async function SchoolFacilitiesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const school = await getSchoolFacilities(id);

  if (!school) notFound();

  const t = await getTranslations("Facilities");

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-5">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-subtle">
            {t("overall")}
          </p>
          <div className="mt-2">
            <StarRating value={school.avgFacilities} />
          </div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-subtle">{t("library")}</p>
          <div className="mt-2">
            <StarRating value={school.avgLibrary} />
          </div>
        </div>
      </div>

      <ProfileSection title={t("onCampus")}>
        {school.facilities.length === 0 ? (
          <EmptyNote>{t("none")}</EmptyNote>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {school.facilities.map((facility) => (
              <div key={facility.id} className="rounded-xl border border-line bg-surface p-5">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent">
                  {facility.category}
                </p>
                <h3 className="mt-1.5 font-medium text-foreground">{facility.nameEn}</h3>
                <p className="text-sm text-subtle">{facility.nameMn}</p>
                {facility.description && (
                  <p className="mt-3 text-sm leading-6 text-muted">{facility.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </ProfileSection>
    </div>
  );
}
