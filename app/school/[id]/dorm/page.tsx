import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSchoolDormitory } from "@/lib/schools";
import { Icon } from "@/components/common/Icon";
import { StarRating } from "@/components/common/StarRating";
import {
  Fact,
  FactGrid,
  IncompleteProfile,
  ProfileSection,
  ProseCard,
  factColumns,
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

  if (!school.dormitory) {
    return (
      <div className="rounded-[1.25rem] border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-muted text-subtle">
          <Icon name="bed" className="size-5" />
        </span>
        <h2 className="mt-4 font-display text-xl font-bold text-foreground">
          {t("noneTitle")}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          {t("noneBody")}
        </p>
      </div>
    );
  }

  const dorm = school.dormitory;
  const tIncomplete = await getTranslations("Incomplete");

  // Known facts only; what's missing is listed once at the bottom.
  const facts: { key: string; label: string; value: React.ReactNode }[] = [];
  if (school.avgDorms) {
    facts.push({ key: "rating", label: t("rating"), value: <StarRating value={school.avgDorms} size="sm" /> });
  }
  if (dorm.roomCapacity) {
    facts.push({ key: "capacity", label: t("capacity"), value: t("perRoom", { count: dorm.roomCapacity }) });
  }
  if (dorm.monthlyFeeAmount) {
    facts.push({
      key: "fee",
      label: t("fee"),
      value: t("feeValue", { amount: dorm.monthlyFeeAmount.toLocaleString("en-US") }),
    });
  }
  const missing = [
    !dorm.roomCapacity && t("capacity"),
    !dorm.monthlyFeeAmount && t("fee"),
    !dorm.livingConditions && t("living"),
    !dorm.boardingRules && t("rules"),
    !dorm.safetyInfo && t("safety"),
  ].filter((label): label is string => Boolean(label));

  return (
    <div className="space-y-10">
      {facts.length > 0 && (
        <FactGrid columns={factColumns(facts.length)}>
          {facts.map((fact) => (
            <Fact key={fact.key} label={fact.label}>
              {fact.value}
            </Fact>
          ))}
        </FactGrid>
      )}

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

      <IncompleteProfile title={tIncomplete("title")} body={tIncomplete("body")} missing={missing} />
    </div>
  );
}
