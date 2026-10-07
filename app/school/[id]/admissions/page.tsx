import { notFound } from "next/navigation";
import { getSchoolAdmissions } from "@/lib/schools";
import { formatDate, formatTuition } from "@/lib/labels";
import {
  EmptyNote,
  Fact,
  FactGrid,
  ProfileSection,
  ProseCard,
} from "@/components/school-profile/ProfileSection";

export default async function SchoolAdmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const school = await getSchoolAdmissions(id);

  if (!school) notFound();

  return (
    <div className="space-y-10">
      <FactGrid columns={2}>
        <Fact label="Annual tuition">
          {school.type === "PUBLIC"
            ? "Free (public school)"
            : formatTuition(school.tuitionMinAnnual, school.tuitionMaxAnnual)}
        </Fact>
        <Fact label="Application deadline">
          {school.applicationDeadline
            ? formatDate(school.applicationDeadline)
            : "Rolling / not specified"}
        </Fact>
      </FactGrid>

      <ProfileSection title="Entrance requirements">
        {school.entranceExamInfo ? (
          <ProseCard>{school.entranceExamInfo}</ProseCard>
        ) : (
          <EmptyNote>No entrance exam information has been added yet.</EmptyNote>
        )}
      </ProfileSection>

      {school.type === "PUBLIC" && (
        <ProfileSection title="Catchment area">
          {school.catchmentAreaInfo ? (
            <ProseCard>{school.catchmentAreaInfo}</ProseCard>
          ) : (
            <EmptyNote>No catchment area information has been added yet.</EmptyNote>
          )}
        </ProfileSection>
      )}
    </div>
  );
}
