import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
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

  const t = await getTranslations("Dorm");
  const tCommon = await getTranslations("Common");

  if (!school.dormitory) {
    return (
      <div className="rounded-xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-muted text-subtle">
          <Icon name="bed" className="size-5" />
        </span>
        <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
          {t("noneTitle")}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          {t("noneBody")}
        </p>
      </div>
    );
  }

  const dorm = school.dormitory;

  return (
    <div className="space-y-10">
      <FactGrid>
        <Fact label={t("rating")}>
          <StarRating value={school.avgDorms} size="sm" />
        </Fact>
        <Fact label={t("capacity")}>
          {dorm.roomCapacity ? t("perRoom", { count: dorm.roomCapacity }) : tCommon("notReported")}
        </Fact>
        <Fact label={t("fee")}>
          {dorm.monthlyFeeAmount
            ? t("feeValue", { amount: dorm.monthlyFeeAmount.toLocaleString("en-US") })
            : tCommon("notReported")}
        </Fact>
      </FactGrid>

      {dorm.livingConditions && (
        <ProfileSection title={t("living")}>
          <ProseCard>{dorm.livingConditions}</ProseCard>
        </ProfileSection>
      )}

      {dorm.boardingRules && (
        <ProfileSection title={t("rules")}>
          <ProseCard>{dorm.boardingRules}</ProseCard>
        </ProfileSection>
      )}

      {dorm.safetyInfo && (
        <ProfileSection title={t("safety")}>
          <ProseCard>{dorm.safetyInfo}</ProseCard>
        </ProfileSection>
      )}
    </div>
  );
}
