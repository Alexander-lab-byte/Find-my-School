import { useFormatter, useTranslations } from "next-intl";
import type { getSchoolReviews } from "@/lib/schools";
import { Badge } from "@/components/common/Badge";
import { Icon } from "@/components/common/Icon";
import { Stars } from "@/components/common/StarRating";
import { reviewAverage, type RatingCategory } from "@/lib/ratings";

type Review = Awaited<ReturnType<typeof getSchoolReviews>>[number];

export function ReviewCard({ review }: { review: Review }) {
  const t = useTranslations("Reviews");
  const tRatings = useTranslations("Ratings");
  const tRole = useTranslations("Role");
  const tTag = useTranslations("ReviewTag");
  const format = useFormatter();
  const avg = reviewAverage(review.rating);
  const scores = review.rating
    ? (
        [
          ["academics", review.rating.academics],
          ["teachers", review.rating.teachers],
          ["facilities", review.rating.facilities],
          ["environment", review.rating.environment],
          ["library", review.rating.library],
          ["dorms", review.rating.dorms],
        ] as const
      ).filter((entry): entry is readonly [RatingCategory, number] => typeof entry[1] === "number")
    : [];

  return (
    <article className="rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-muted font-medium text-muted"
          >
            {review.user.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground">{review.user.name}</span>
              <Badge tone={review.user.isVerified ? "verified" : "neutral"}>
                {review.user.isVerified && <Icon name="shield" className="size-3" />}
                {review.user.isVerified ? `${t("verified")} ` : ""}
                {tRole(review.user.role)}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-subtle">{format.dateTime(new Date(review.createdAt), { dateStyle: "long" })}</p>
          </div>
        </div>
        {avg !== null && (
          <span className="flex items-center gap-2 text-sm">
            <Stars value={avg} />
            <span className="font-semibold text-foreground">{avg.toFixed(1)}</span>
          </span>
        )}
      </div>

      {review.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {review.tags.map((tag) => (
            <Badge key={tag} tone="accent">
              {tTag(tag)}
            </Badge>
          ))}
        </div>
      )}

      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-foreground">{review.bodyText}</p>

      {scores.length > 0 && (
        <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3 text-xs text-muted">
          {scores.map(([key, score]) => (
            <div key={key} className="flex gap-1">
              <dt>{tRatings(key)}</dt>
              <dd className="font-medium tabular-nums text-foreground">{score}/5</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
}
