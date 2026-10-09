import type { Metadata } from "next";
import Link from "next/link";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { reviewAverage } from "@/lib/ratings";
import { schoolNames } from "@/lib/labels";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { Badge } from "@/components/common/Badge";
import { Icon } from "@/components/common/Icon";
import { Stars } from "@/components/common/StarRating";
import { ReviewBody } from "@/components/reviews/ReviewBody";
import { DeleteReviewButton } from "@/components/reviews/DeleteReviewButton";
import { deleteMyReview } from "@/app/my-reviews/actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("MyReviews");
  return { title: t("title") };
}

const STATUS_TONE: Record<string, "pending" | "verified" | "neutral"> = {
  PENDING: "pending",
  PUBLISHED: "verified",
};

export default async function MyReviewsPage() {
  const t = await getTranslations("MyReviews");
  const user = await getCurrentUser();
  if (!user) {
    return <LoginPrompt title={t("title")} message={t("loginMessage")} next="/my-reviews" />;
  }

  const [reviews, tTag, format, locale] = await Promise.all([
    prisma.review.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        rating: true,
        school: { select: { id: true, nameEn: true, nameMn: true } },
      },
    }),
    getTranslations("ReviewTag"),
    getFormatter(),
    getLocale(),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{t("eyebrow")}</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-muted">{t("intro")}</p>

      <div className="mt-8 space-y-4">
        {reviews.length === 0 && (
          <div className="rounded-xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-muted text-subtle">
              <Icon name="pencil" className="size-5" />
            </span>
            <h2 className="mt-4 font-display text-xl font-semibold text-foreground">{t("emptyTitle")}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">{t("emptyBody")}</p>
            <Link
              href="/search"
              className="mt-6 inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
            >
              {t("findSchool")}
            </Link>
          </div>
        )}

        {reviews.map((review) => {
          const avg = reviewAverage(review.rating);
          const { primary, secondary } = schoolNames(review.school, locale);
          return (
            <article key={review.id} className="rounded-xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/school/${review.school.id}/reviews`}
                    className="font-display text-lg font-semibold text-foreground hover:text-accent"
                  >
                    {primary}
                  </Link>
                  {secondary && <p className="text-sm text-muted">{secondary}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={STATUS_TONE[review.status] ?? "neutral"}>
                    {review.status === "PENDING" && <Icon name="clock" className="size-3" />}
                    {t.has(`status.${review.status}`) ? t(`status.${review.status}`) : review.status}
                  </Badge>
                  {avg !== null && (
                    <span className="flex items-center gap-2 text-sm">
                      <Stars value={avg} />
                      <span className="font-semibold text-foreground">{avg.toFixed(1)}</span>
                    </span>
                  )}
                </div>
              </div>

              {review.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {review.tags.map((tag) => (
                    <Badge key={tag} tone="accent">
                      {tTag(tag)}
                    </Badge>
                  ))}
                </div>
              )}

              <ReviewBody text={review.bodyText} />

              {review.status === "REJECTED" && (
                <p className="mt-3 text-sm text-muted">
                  {t("rejectedHint")}{" "}
                  <Link
                    href={`/school/${review.school.id}/reviews#write-review`}
                    className="font-medium text-accent hover:underline"
                  >
                    {t("writeAgain")}
                  </Link>
                </p>
              )}

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
                <p className="text-xs text-subtle">
                  {format.dateTime(review.createdAt, { dateStyle: "long" })}
                </p>
                <DeleteReviewButton action={deleteMyReview.bind(null, review.id)} />
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
