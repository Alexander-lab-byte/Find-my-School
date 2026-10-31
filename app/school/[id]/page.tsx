import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSchoolOverview } from "@/lib/schools";
import { ratingCategories } from "@/lib/ratings";
import { displayUrl, externalUrl, formatLocation, tuitionSummary } from "@/lib/labels";
import { Badge } from "@/components/common/Badge";
import { Icon, type IconName } from "@/components/common/Icon";
import { RatingSummary } from "@/components/reviews/RatingSummary";
import {
  Fact,
  FactGrid,
  IncompleteProfile,
  ProfileSection,
  factColumns,
} from "@/components/school-profile/ProfileSection";
import { SchoolHighlights } from "@/components/school-profile/SchoolHighlights";
import { SchoolMap } from "@/components/map/SchoolMap";

type Contact = {
  icon: IconName;
  /** Key in the "Overview" namespace. */
  label: "address" | "phone" | "email" | "website";
  value: string;
  href?: string;
  external?: boolean;
};

export default async function SchoolOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const school = await getSchoolOverview(id);

  if (!school) notFound();

  const t = await getTranslations("Overview");
  const tType = await getTranslations("SchoolType");
  const tLevel = await getTranslations("Level");
  const tCurriculum = await getTranslations("Curriculum");
  const tLanguage = await getTranslations("Language");
  const tTuition = await getTranslations("Tuition");
  const tMap = await getTranslations("Map");
  const tPlace = await getTranslations("Place");

  const tIncomplete = await getTranslations("Incomplete");

  // Only facts we actually know; the unknown ones are listed once, below.
  const hasTuition = school.type === "PUBLIC" || school.tuitionMinAnnual || school.tuitionMaxAnnual;
  const languages = school.teachingLanguages.map((l) => (tLanguage.has(l) ? tLanguage(l) : l)).join(", ");
  const facts: { label: string; value: string }[] = [
    { label: t("schoolType"), value: tType(school.type) },
    { label: t("gradeLevels"), value: tLevel(school.level) },
    { label: t("dormitory"), value: school.dormitory ? t("available") : t("notOffered") },
  ];
  if (hasTuition) {
    facts.push({
      label: t("tuition"),
      value: tuitionSummary(tTuition, school.type, school.tuitionMinAnnual, school.tuitionMaxAnnual),
    });
  }
  if (languages) facts.push({ label: t("languages"), value: languages });
  if (school.accreditation) facts.push({ label: t("accreditation"), value: school.accreditation });

  const missing = [
    !hasTuition && t("tuition"),
    !languages && t("languages"),
    !school.accreditation && t("accreditation"),
    !school.phone && t("phone"),
    !school.email && t("email"),
    !school.website && t("website"),
  ].filter((label): label is string => Boolean(label));

  const contacts: Contact[] = [];
  contacts.push({
    icon: "map-pin",
    label: "address",
    value: [school.address, formatLocation(tPlace, school)].filter(Boolean).join(", "),
  });
  if (school.phone) {
    contacts.push({ icon: "phone", label: "phone", value: school.phone, href: `tel:${school.phone}` });
  }
  if (school.email) {
    contacts.push({ icon: "mail", label: "email", value: school.email, href: `mailto:${school.email}` });
  }
  const website = externalUrl(school.website);
  if (website) {
    contacts.push({
      icon: "globe",
      label: "website",
      value: displayUrl(website),
      href: website,
      external: true,
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-10">
        <SchoolHighlights
          foundedYear={school.foundedYear}
          studentTeacherRatio={school.studentTeacherRatio}
          curriculum={school.curriculum}
          graduateDestinations={school.graduateDestinations}
          notableAchievements={school.notableAchievements}
        />

        <ProfileSection title={t("atAGlance")}>
          <FactGrid columns={factColumns(facts.length)}>
            {facts.map((fact) => (
              <Fact key={fact.label} label={fact.label}>
                {fact.value}
              </Fact>
            ))}
          </FactGrid>
        </ProfileSection>

        {school.curriculum.length > 0 && (
          <ProfileSection title={t("curriculum")}>
            <div className="flex flex-wrap gap-2">
              {school.curriculum.map((c) => (
                <Badge key={c} tone="accent">
                  {tCurriculum(c)}
                </Badge>
              ))}
            </div>
          </ProfileSection>
        )}

        <ProfileSection
          title={t("ratings")}
          action={
            <Link
              href={`/school/${id}/reviews`}
              className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline hover:underline-offset-4"
            >
              {school.reviewCount > 0 ? t("readAll") : t("writeFirst")}
              <Icon name="arrow-right" className="size-4" />
            </Link>
          }
        >
          <RatingSummary
            overall={school.avgOverall}
            count={school.reviewCount}
            categories={ratingCategories(school, Boolean(school.dormitory))}
            writeHref={`/school/${id}/reviews#write-review`}
          />
        </ProfileSection>

        <IncompleteProfile
          title={tIncomplete("title")}
          body={tIncomplete("body")}
          missing={missing}
        />
      </div>

      <aside className="space-y-4">
        {school.latitude != null && school.longitude != null && (
          <div>
            <SchoolMap
              height={200}
              schools={[
                {
                  ...school,
                  id,
                  latitude: school.latitude,
                  longitude: school.longitude,
                },
              ]}
            />
            {school.locationApproximate && (
              <p className="mt-1.5 text-xs text-muted">{tMap("approximateNote")}</p>
            )}
          </div>
        )}
        <div className="reveal rounded-[1.75rem] border border-line bg-surface shadow-[var(--shadow-card)] p-5">
          <h2 className="text-sm font-semibold text-foreground">{t("contact")}</h2>
          {contacts.length > 0 ? (
            <ul className="mt-4 space-y-4 text-sm">
              {contacts.map((contact) => (
                <li key={contact.label} className="flex gap-3">
                  <Icon name={contact.icon} className="mt-0.5 size-4 shrink-0 text-subtle" />
                  <div className="min-w-0">
                    <p className="text-xs text-subtle">{t(contact.label)}</p>
                    {contact.href ? (
                      <a
                        href={contact.href}
                        target={contact.external ? "_blank" : undefined}
                        rel={contact.external ? "noopener noreferrer" : undefined}
                        className="wrap-break-word text-accent hover:underline hover:underline-offset-4"
                      >
                        {contact.value}
                      </a>
                    ) : (
                      <p className="wrap-break-word text-foreground">{contact.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">{t("noContact")}</p>
          )}
        </div>
      </aside>
    </div>
  );
}
