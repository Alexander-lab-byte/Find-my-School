import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import { getSchoolAdmissions } from "@/lib/schools";
import { tuitionSummary } from "@/lib/labels";
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

  const t = await getTranslations("Admissions");
  const tTuition = await getTranslations("Tuition");
  const format = await getFormatter();

  return (
    <div className="space-y-10">
      <FactGrid columns={2}>
        <Fact label={t("tuition")}>
          {tuitionSummary(tTuition, school.type, school.tuitionMinAnnual, school.tuitionMaxAnnual)}
        </Fact>
        <Fact label={t("deadline")}>
          {school.applicationDeadline
            ? format.dateTime(school.applicationDeadline, { dateStyle: "long" })
            : t("rolling")}
        </Fact>
      </FactGrid>

      <ProfileSection title={t("entrance")}>
        {school.entranceExamInfo ? (
          <ProseCard>{school.entranceExamInfo}</ProseCard>
        ) : (
          <EmptyNote>{t("entranceNone")}</EmptyNote>
        )}
      </ProfileSection>

      {school.type === "PUBLIC" && (
        <ProfileSection title={t("catchment")}>
          {school.catchmentAreaInfo ? (
            <ProseCard>{school.catchmentAreaInfo}</ProseCard>
          ) : (
            <EmptyNote>{t("catchmentNone")}</EmptyNote>
          )}
        </ProfileSection>
      )}
    </div>
  );
}
