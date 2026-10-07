import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSchoolRatings, getSchoolReviews } from "@/lib/schools";
import { ratingCategories } from "@/lib/ratings";
import { Icon } from "@/components/common/Icon";
import { RatingSummary } from "@/components/reviews/RatingSummary";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { EmptyNote } from "@/components/school-profile/ProfileSection";

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

  // Display-only hint from the proxy (see lib/supabase/middleware.ts); the
  // submit action itself still verifies the user server-side.
  const isSignedIn = (await headers()).get("x-user-signed-in") === "1";
  const hasDorm = Boolean(school.dormitory);
  const loginHref = `/login?next=${encodeURIComponent(`/school/${id}/reviews`)}`;

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
            {isSignedIn ? (
              <ReviewForm schoolId={id} hasDorm={hasDorm} />
            ) : (
              <div className="rounded-xl border border-line bg-surface p-6">
                <span className="flex size-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Icon name="pencil" className="size-5" />
                </span>
                <p className="mt-4 font-medium text-foreground">{t("shareTitle")}</p>
                <p className="mt-1.5 text-sm leading-6 text-muted">
                  {t("shareBody")}
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  <Link
                    href={loginHref}
                    className="rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
                  >
                    {t("loginToWrite")}
                  </Link>
                  <Link
                    href={`/register?next=${encodeURIComponent(`/school/${id}/reviews`)}`}
                    className="rounded-lg border border-line px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
                  >
                    {t("createAccount")}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
