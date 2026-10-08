import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getSchoolRatings, getSchoolReviews } from "@/lib/schools";
import { ratingCategories } from "@/lib/ratings";
import { getReviewAccess } from "@/lib/review-access";
import { schoolNames } from "@/lib/labels";
import { Icon } from "@/components/common/Icon";
import { RatingSummary } from "@/components/reviews/RatingSummary";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { EmptyNote } from "@/components/school-profile/ProfileSection";

function AccessCard({
  icon,
  title,
  children,
}: {
  icon: "mail" | "lock";
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-6">
      <span className="flex size-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
        <Icon name={icon} className="size-5" />
      </span>
      <p className="mt-4 font-medium text-foreground">{title}</p>
      <div className="mt-1.5 text-sm leading-6 text-muted">{children}</div>
    </div>
  );
}

export default async function SchoolReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [school, reviews] = await Promise.all([getSchoolRatings(id), getSchoolReviews(id)]);

  if (!school) notFound();

  const t = await getTranslations("Reviews");
  const tCommon = await getTranslations("Common");

  // The proxy's signed-in hint only decides whether to ask Supabase who
  // this is; getReviewAccess verifies the email itself, and submitReview
  // checks again on submit.
  const isSignedIn = (await headers()).get("x-user-signed-in") === "1";
  const access = await getReviewAccess({ id, emailDomains: school.emailDomains }, { isSignedIn });
  const tAccess = await getTranslations("ReviewAccess");
  const locale = await getLocale();
  const hasDorm = Boolean(school.dormitory);
  const loginHref = `/login?next=${encodeURIComponent(`/school/${id}/reviews`)}`;
  const domainList = (domains: string[]) => domains.map((d) => `@${d}`).join(", ");

  return (
    <div className="space-y-10">
      <RatingSummary
        overall={school.avgOverall}
        count={school.reviewCount}
        categories={ratingCategories(school, hasDorm)}
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-labelledby="reviews-heading">
          <h2 id="reviews-heading" className="font-display text-xl font-semibold text-foreground">
            {reviews.length === 0 ? t("heading") : tCommon("reviewCount", { count: reviews.length })}
          </h2>
          <div className="mt-4 space-y-4">
            {reviews.length === 0 && (
              <EmptyNote>
                {t("none")}
              </EmptyNote>
            )}
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>

        <section id="write-review" aria-labelledby="write-review-heading" className="scroll-mt-20">
          <h2 id="write-review-heading" className="font-display text-xl font-semibold text-foreground">
            {t("write")}
          </h2>
          <div className="mt-4">
            {access.status === "allowed" ? (
              <ReviewForm schoolId={id} hasDorm={hasDorm} />
            ) : access.status === "signed-out" ? (
              <AccessCard icon="mail" title={tAccess("signedOutTitle")}>
                <p>{tAccess("signedOutBody", { domains: domainList(access.schoolDomains) })}</p>
                <Link
                  href={loginHref}
                  className="mt-5 block rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
                >
                  {t("loginToWrite")}
                </Link>
              </AccessCard>
            ) : access.status === "wrong-domain" ? (
              <AccessCard icon="lock" title={tAccess("wrongDomainTitle")}>
                <p>
                  {tAccess.rich("wrongDomainBody", {
                    domains: domainList(access.schoolDomains),
                    email: access.email,
                    b: (chunks) => <span className="font-medium text-foreground">{chunks}</span>,
                  })}
                </p>
                {access.ownSchool && (
                  <Link
                    href={`/school/${access.ownSchool.id}/reviews#write-review`}
                    className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-line px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
                  >
                    {tAccess("reviewOwnSchool", { school: schoolNames(access.ownSchool, locale).primary })}
                    <Icon name="arrow-right" className="size-4" />
                  </Link>
                )}
              </AccessCard>
            ) : (
              <AccessCard icon="lock" title={tAccess("closedTitle")}>
                <p>{tAccess("closedBody")}</p>
              </AccessCard>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
