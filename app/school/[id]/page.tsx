import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getSchoolOverview } from "@/lib/schools";
import { ratingCategories } from "@/lib/ratings";
import { displayUrl, externalUrl, formatLocation, tuitionSummary } from "@/lib/labels";
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
import { SchoolsMapFrame } from "@/components/map/SchoolsMapFrame";
import { SCHOOL_PHOTOS } from "@/lib/school-photos";

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
  const tHighlights = await getTranslations("Highlights");
  const tCurriculum = await getTranslations("Curriculum");
  const tLanguage = await getTranslations("Language");
  const tTuition = await getTranslations("Tuition");
  const tMap = await getTranslations("Map");
  const tPlace = await getTranslations("Place");

  const tIncomplete = await getTranslations("Incomplete");
  const locale = await getLocale();
  // Free-licensed photo of the building, when we have one (credit is required).
  const photo = SCHOOL_PHOTOS[school.nameEn];

  // Only facts we actually know; the unknown ones are listed once, below.
  const hasTuition = school.type === "PUBLIC" || school.tuitionMinAnnual || school.tuitionMaxAnnual;
  const languages = school.teachingLanguages.map((l) => (tLanguage.has(l) ? tLanguage(l) : l)).join(", ");
  // School type and level are already in the header above; these are the rest.
  const facts: { label: string; value: string }[] = [];
  if (hasTuition) {
    facts.push({
      label: t("tuition"),
      value: tuitionSummary(tTuition, school.type, school.tuitionMinAnnual, school.tuitionMaxAnnual),
    });
  }
  if (languages) facts.push({ label: t("languages"), value: languages });
  if (school.curriculum.length > 0) {
    facts.push({ label: t("curriculum"), value: school.curriculum.map((c) => tCurriculum(c)).join(", ") });
  }
  facts.push({ label: t("dormitory"), value: school.dormitory ? t("available") : t("notOffered") });
  if (school.foundedYear) facts.push({ label: tHighlights("founded"), value: String(school.foundedYear) });
  if (school.studentTeacherRatio) {
    facts.push({ label: tHighlights("ratio"), value: school.studentTeacherRatio });
  }
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
        <ProfileSection title={t("atAGlance")}>
          <FactGrid columns={factColumns(facts.length)}>
            {facts.map((fact) => (
              <Fact key={fact.label} label={fact.label}>
                {fact.value}
              </Fact>
            ))}
          </FactGrid>
        </ProfileSection>

        <SchoolHighlights
          graduateDestinations={school.graduateDestinations}
          notableAchievements={school.notableAchievements}
        />

        <ProfileSection
          title={t("ratings")}
          // With no reviews yet, the empty state below already carries the one "write" button.
          action={
            school.reviewCount > 0 && (
              <Link href={`/school/${id}/reviews`} className="link inline-flex items-center gap-1 text-sm">
                {t("readAll")}
                <Icon name="arrow-right" className="size-4" />
              </Link>
            )
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
        {photo && (
          <figure className="plate overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element -- hosted by Wikimedia Commons */}
            <img
              src={photo.url}
              alt={t("photoAlt", { name: school.nameEn })}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full bg-surface-muted object-cover"
            />
            <figcaption className="px-3 py-2 text-xs text-subtle">
              {t("photoBy")}{" "}
              <a href={photo.page} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
                {photo.author} · {photo.license}
              </a>
            </figcaption>
          </figure>
        )}
        {school.latitude != null && school.longitude != null && (
          <div>
            <SchoolsMapFrame locale={locale} title={tMap("title")} schoolId={id} className="h-[240px]" />
            {school.locationApproximate && (
              <p className="mt-1.5 text-xs text-muted">{tMap("approximateNote")}</p>
            )}
          </div>
        )}
        <div className="plate p-5">
          <h2 className="font-display text-base font-semibold text-foreground">{t("contact")}</h2>
          {contacts.length > 0 ? (
            <ul className="mt-4 space-y-4 text-sm">
              {contacts.map((contact) => (
                <li key={contact.label} className="flex gap-3">
                  <Icon name={contact.icon} className="mt-0.5 size-4 shrink-0 text-subtle" />
                  <div className="min-w-0">
                    <p className="label">{t(contact.label)}</p>
                    {contact.href ? (
                      <a
                        href={contact.href}
                        target={contact.external ? "_blank" : undefined}
                        rel={contact.external ? "noopener noreferrer" : undefined}
                        className="link wrap-break-word"
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
