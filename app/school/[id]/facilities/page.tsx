import { notFound } from "next/navigation";
import { getSchoolFacilities } from "@/lib/schools";
import { StarRating } from "@/components/common/StarRating";
import {
  EmptyNote,
  Fact,
  FactGrid,
  ProfileSection,
} from "@/components/school-profile/ProfileSection";

export default async function SchoolFacilitiesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const school = await getSchoolFacilities(id);

  if (!school) notFound();

  return (
    <div className="space-y-10">
      <ProfileSection title="Ratings">
        <FactGrid columns={2}>
          <Fact label="Facilities overall">
            <StarRating value={school.avgFacilities} size="sm" />
          </Fact>
          <Fact label="Library">
            <StarRating value={school.avgLibrary} size="sm" />
          </Fact>
        </FactGrid>
      </ProfileSection>

      <ProfileSection title="On campus">
        {school.facilities.length === 0 ? (
          <EmptyNote>No facility details have been added for this school yet.</EmptyNote>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {school.facilities.map((facility) => (
              <div key={facility.id} className="rounded-xl border border-line bg-surface p-4">
                <div className="text-xs text-subtle">{facility.category}</div>
                <div className="mt-1 font-medium text-foreground">{facility.nameEn}</div>
                {facility.description && (
                  <p className="mt-2 text-sm text-muted">{facility.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </ProfileSection>
    </div>
  );
}
