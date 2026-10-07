import type { getSchoolReviews } from "@/lib/schools";
import { Badge } from "@/components/common/Badge";
import { ReviewBody } from "@/components/reviews/ReviewBody";
import { REVIEW_TAG_LABELS, ROLE_LABELS } from "@/lib/labels";

type Review = Awaited<ReturnType<typeof getSchoolReviews>>[number];

export function ReviewCard({ review }: { review: Review }) {
  const avg = review.rating
    ? (review.rating.academics +
        review.rating.facilities +
        review.rating.teachers +
        review.rating.environment) /
      4
    : null;

  return (
    <div className="rounded-[var(--radius-card)] border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{review.user.name}</span>
          <Badge tone={review.user.isVerified ? "verified" : "neutral"}>
            {review.user.isVerified ? "Verified " : ""}
            {ROLE_LABELS[review.user.role]}
          </Badge>
        </div>
        {avg !== null && (
          <span className="text-sm text-amber-500" aria-label={`${avg.toFixed(1)} out of 5`}>
            {"★".repeat(Math.round(avg))}
            {"☆".repeat(5 - Math.round(avg))}
          </span>
        )}
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

      <p className="mt-3 text-xs text-zinc-400">
        {new Date(review.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  );
}
