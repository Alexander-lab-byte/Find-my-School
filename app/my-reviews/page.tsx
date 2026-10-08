import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { Badge } from "@/components/common/Badge";
import { ReviewBody } from "@/components/reviews/ReviewBody";
import { DeleteReviewButton } from "@/components/reviews/DeleteReviewButton";
import { EmptyNote } from "@/components/school-profile/ProfileSection";
import { REVIEW_TAG_LABELS } from "@/lib/labels";
import { reviewAverage } from "@/lib/ratings";
import { deleteMyReview } from "@/app/my-reviews/actions";

export const metadata = { title: "My reviews" };

export default async function MyReviewsPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <LoginPrompt
        title="My reviews"
        message="Log in to see the reviews you've written."
        next="/my-reviews"
      />
    );
  }

  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      rating: true,
      school: { select: { id: true, nameEn: true, nameMn: true } },
    },
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-foreground">My reviews</h1>

      <div className="mt-6 space-y-4">
        {reviews.length === 0 && (
          <EmptyNote>
            You haven&apos;t reviewed any schools yet.{" "}
            <Link href="/search" className="text-accent underline underline-offset-4">
              Find a school to review
            </Link>
          </EmptyNote>
        )}

        {reviews.map((review) => {
          const avg = reviewAverage(review.rating);
          return (
            <article key={review.id} className="rounded-xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/school/${review.school.id}/reviews`}
                    className="font-medium text-foreground hover:text-accent"
                  >
                    {review.school.nameEn}
                  </Link>
                  <p className="text-sm text-muted">{review.school.nameMn}</p>
                </div>
                <div className="flex items-center gap-2">
                  {review.status !== "PUBLISHED" && <Badge>Hidden by moderators</Badge>}
                  {avg !== null && (
                    <span className="text-sm text-amber-500" aria-label={`${avg.toFixed(1)} out of 5`}>
                      {"★".repeat(Math.round(avg))}
                      {"☆".repeat(5 - Math.round(avg))}
                    </span>
                  )}
                </div>
              </div>

              {review.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {review.tags.map((tag) => (
                    <Badge key={tag} tone="accent">
                      {REVIEW_TAG_LABELS[tag]}
                    </Badge>
                  ))}
                </div>
              )}

              <ReviewBody text={review.bodyText} />

              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-xs text-zinc-400">
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <DeleteReviewButton action={deleteMyReview.bind(null, review.id)} />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
