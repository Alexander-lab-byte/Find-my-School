import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import { getSchoolAdmissions } from "@/lib/schools";
import { tuitionSummary } from "@/lib/labels";
import {
  Fact,
  IncompleteProfile,
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

  const t = await getTranslations("Admissions");
  const tTuition = await getTranslations("Tuition");
  const format = await getFormatter();
  const tIncomplete = await getTranslations("Incomplete");
  const missing = [
    school.type !== "PUBLIC" && !school.tuitionMinAnnual && !school.tuitionMaxAnnual && t("tuition"),
    !school.applicationDeadline && t("deadline"),
    !school.entranceExamInfo && t("entrance"),
    school.type === "PUBLIC" && !school.catchmentAreaInfo && t("catchment"),
  ].filter((label): label is string => Boolean(label));

  return (
    <div className="space-y-10">
      <FactGrid columns={2}>
        <Fact label={t("tuition")}>
          {tuitionSummary(tTuition, school.type, school.tuitionMinAnnual, school.tuitionMaxAnnual)}
        </Fact>
        {school.applicationDeadline && (
          <Fact label={t("deadline")}>
            {format.dateTime(school.applicationDeadline, { dateStyle: "long" })}
          </Fact>
        )}
      </FactGrid>

      {school.entranceExamInfo && (
        <ProfileSection title={t("entrance")}>
          <ProseCard>{school.entranceExamInfo}</ProseCard>
        </ProfileSection>
      )}

      {school.type === "PUBLIC" && school.catchmentAreaInfo && (
        <ProfileSection title={t("catchment")}>
          <ProseCard>{school.catchmentAreaInfo}</ProseCard>
        </ProfileSection>
      )}

      <IncompleteProfile title={tIncomplete("title")} body={tIncomplete("body")} missing={missing} />
    </div>
  );
}
