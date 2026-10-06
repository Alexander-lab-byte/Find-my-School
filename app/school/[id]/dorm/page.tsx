import { notFound } from "next/navigation";
import { getSchoolDormitory } from "@/lib/schools";
import { Icon } from "@/components/common/Icon";
import { StarRating } from "@/components/common/StarRating";
import {
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
    return (
      <div className="rounded-xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-muted text-subtle">
          <Icon name="bed" className="size-5" />
        </span>
        <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
          No on-campus housing
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          This school does not offer dormitory accommodation.
        </p>
      </div>
    );
  }

  const dorm = school.dormitory;

  return (
    <div className="space-y-10">
      <FactGrid>
        <Fact label="Dormitory rating">
          <StarRating value={school.avgDorms} size="sm" />
        </Fact>
        <Fact label="Room capacity">
          {dorm.roomCapacity ? `${dorm.roomCapacity} students per room` : "Not reported"}
        </Fact>
        <Fact label="Monthly fee">
          {dorm.monthlyFeeAmount
            ? `₮${dorm.monthlyFeeAmount.toLocaleString()} / month`
            : "Not reported"}
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
