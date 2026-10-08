import { notFound } from "next/navigation";
import { getSchoolOverview } from "@/lib/schools";
import { Badge } from "@/components/common/Badge";
import { RatingSummary } from "@/components/reviews/RatingSummary";
import { Fact, FactGrid, ProfileSection } from "@/components/school-profile/ProfileSection";
import { CURRICULUM_LABELS, LANGUAGE_NAMES } from "@/lib/labels";
import { ratingCategories } from "@/lib/ratings";

export default async function SchoolOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const school = await getSchoolOverview(id);

  if (!school) notFound();

  const languages = school.teachingLanguages.map((l) => LANGUAGE_NAMES[l] ?? l.toUpperCase());

  return (
    <div className="space-y-10">
      <ProfileSection title="Curriculum & instruction">
        {school.curriculum.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {school.curriculum.map((c) => (
              <Badge key={c} tone="accent">
                {CURRICULUM_LABELS[c]}
              </Badge>
            ))}
          </div>
        )}
        <FactGrid columns={3}>
          <Fact label="Teaching languages">
            {languages.length > 0 ? languages.join(", ") : "Not reported"}
          </Fact>
          <Fact label="Student–teacher ratio">{school.studentTeacherRatio ?? "Not reported"}</Fact>
          <Fact label="Accreditation">{school.accreditation ?? "Not reported"}</Fact>
        </FactGrid>
      </ProfileSection>

      <ProfileSection title="Community ratings">
        <RatingSummary
          overall={school.avgOverall}
          count={school.reviewCount}
          categories={ratingCategories(school, Boolean(school.dormitory))}
        />
      </ProfileSection>
    </div>
  );
}
