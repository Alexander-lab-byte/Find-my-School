import { notFound } from "next/navigation";
import { getSchoolDormitory } from "@/lib/schools";
import { StarRating } from "@/components/common/StarRating";
import {
  EmptyNote,
  Fact,
  FactGrid,
  ProfileSection,
  ProseCard,
} from "@/components/school-profile/ProfileSection";

export default async function SchoolDormitoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const school = await getSchoolDormitory(id);

  if (!school) notFound();

  if (!school.dormitory) {
    return <EmptyNote>This school does not offer on-campus dormitory housing.</EmptyNote>;
  }

  const dorm = school.dormitory;

  return (
    <div className="space-y-10">
      <FactGrid columns={3}>
        <Fact label="Rating">
          <StarRating value={school.avgDorms} size="sm" />
        </Fact>
        <Fact label="Room capacity">
          {dorm.roomCapacity ? `${dorm.roomCapacity} students per room` : "Not reported"}
        </Fact>
        <Fact label="Monthly fee">
          {dorm.monthlyFeeAmount ? `₮${dorm.monthlyFeeAmount.toLocaleString()} / month` : "Not reported"}
        </Fact>
      </FactGrid>

      {dorm.livingConditions && (
        <ProfileSection title="Living conditions">
          <ProseCard>{dorm.livingConditions}</ProseCard>
        </ProfileSection>
      )}

      {dorm.boardingRules && (
        <ProfileSection title="Boarding rules">
          <ProseCard>{dorm.boardingRules}</ProseCard>
        </ProfileSection>
      )}

      {dorm.safetyInfo && (
        <ProfileSection title="Safety">
          <ProseCard>{dorm.safetyInfo}</ProseCard>
        </ProfileSection>
      )}
    </div>
  );
}
