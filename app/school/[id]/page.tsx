import Link from "next/link";
import { notFound } from "next/navigation";
import { getSchoolOverview } from "@/lib/schools";
import { ratingCategories } from "@/lib/ratings";
import {
  CURRICULUM_LABELS,
  LANGUAGE_LABELS,
  LEVEL_LABELS,
  TYPE_LABELS,
  tuitionSummary,
} from "@/lib/labels";
import { Badge } from "@/components/common/Badge";
import { Icon, type IconName } from "@/components/common/Icon";
import { RatingSummary } from "@/components/reviews/RatingSummary";
import { Fact, FactGrid, ProfileSection } from "@/components/school-profile/ProfileSection";
import { SchoolHighlights } from "@/components/school-profile/SchoolHighlights";

type Contact = {
  icon: IconName;
  label: string;
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

  const contacts: Contact[] = [];
  if (school.address) contacts.push({ icon: "map-pin", label: "Address", value: school.address });
  if (school.phone) {
    contacts.push({ icon: "phone", label: "Phone", value: school.phone, href: `tel:${school.phone}` });
  }
  if (school.email) {
    contacts.push({ icon: "mail", label: "Email", value: school.email, href: `mailto:${school.email}` });
  }
  if (school.website) {
    contacts.push({
      icon: "globe",
      label: "Website",
      value: school.website.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      href: school.website,
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

        <ProfileSection title="At a glance">
          <FactGrid>
            <Fact label="School type">{TYPE_LABELS[school.type]}</Fact>
            <Fact label="Grade levels">{LEVEL_LABELS[school.level]}</Fact>
            <Fact label="Annual tuition">
              {tuitionSummary(school.type, school.tuitionMinAnnual, school.tuitionMaxAnnual)}
            </Fact>
            <Fact label="Teaching languages">
              {school.teachingLanguages.length > 0
                ? school.teachingLanguages.map((l) => LANGUAGE_LABELS[l] ?? l).join(", ")
                : "Not reported"}
            </Fact>
            <Fact label="Accreditation">{school.accreditation ?? "Not reported"}</Fact>
            <Fact label="Dormitory">{school.dormitory ? "Available" : "Not offered"}</Fact>
          </FactGrid>
        </ProfileSection>

        <ProfileSection title="Curriculum">
          <div className="flex flex-wrap gap-2">
            {school.curriculum.map((c) => (
              <Badge key={c} tone="accent">
                {CURRICULUM_LABELS[c]}
              </Badge>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection
          title="Community ratings"
          action={
            <Link
              href={`/school/${id}/reviews`}
              className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline hover:underline-offset-4"
            >
              {school.reviewCount > 0 ? "Read all reviews" : "Write the first review"}
              <Icon name="arrow-right" className="size-4" />
            </Link>
          }
        >
          <RatingSummary
            overall={school.avgOverall}
            count={school.reviewCount}
            categories={ratingCategories(school, Boolean(school.dormitory))}
          />
        </ProfileSection>
      </div>

      <aside>
        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">Contact</h2>
          {contacts.length > 0 ? (
            <ul className="mt-4 space-y-4 text-sm">
              {contacts.map((contact) => (
                <li key={contact.label} className="flex gap-3">
                  <Icon name={contact.icon} className="mt-0.5 size-4 shrink-0 text-subtle" />
                  <div className="min-w-0">
                    <p className="text-xs text-subtle">{contact.label}</p>
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
            <p className="mt-3 text-sm text-muted">No contact details have been added yet.</p>
          )}
        </div>
      </aside>
    </div>
  );
}
