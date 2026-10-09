import Link from "next/link";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import type { ModerationReview } from "@/lib/admin";
import { domainMatches, emailDomain } from "@/lib/review-access";
import { reviewAverage, reviewScores } from "@/lib/ratings";
import { schoolNames } from "@/lib/labels";
import { approveReview, rejectReview } from "@/app/admin/reviews/actions";
import { Badge } from "@/components/common/Badge";
import { Icon } from "@/components/common/Icon";
import { Stars } from "@/components/common/StarRating";
import { ModerationButton } from "@/components/admin/ModerationButton";

const STATUS_TONE = {
  PENDING: "pending",
  PUBLISHED: "verified",
  REJECTED: "neutral",
  HIDDEN: "neutral",
} as const;

/** A review as an admin sees it: who wrote it, from which email, and the decision buttons. */
export function ModerationReviewCard({ review }: { review: ModerationReview }) {
  const t = useTranslations("Admin");
  const tRatings = useTranslations("Ratings");
  const tRole = useTranslations("Role");
  const tTag = useTranslations("ReviewTag");
  const format = useFormatter();
  const locale = useLocale();

  const { primary, secondary } = schoolNames(review.school, locale);
  const avg = reviewAverage(review.rating);
  const scores = reviewScores(review.rating);
  const domain = emailDomain(review.user.email);
  // Reviews written before the school-email rule (or by test accounts) won't match.
  const fromSchoolEmail = domain !== null && domainMatches(domain, review.school.emailDomains);
  const status = review.status as keyof typeof STATUS_TONE;

  return (
    <article className="rounded-xl border border-line bg-surface">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <Link
            href={`/school/${review.school.id}/reviews`}
            className="font-display text-lg font-semibold text-foreground hover:text-accent"
          >
            {primary}
          </Link>
          {secondary && <p className="text-sm text-muted">{secondary}</p>}
        </div>
        <Badge tone={STATUS_TONE[status] ?? "neutral"}>
          {status === "PENDING" && <Icon name="clock" className="size-3" />}
          {t.has(`status.${status}`) ? t(`status.${status}`) : status}
        </Badge>
      </header>

      <div className="space-y-4 px-5 py-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-sm font-medium text-muted"
          >
            {review.user.name.charAt(0).toUpperCase()}
          </span>
          <span className="font-medium text-foreground">{review.user.name}</span>
          <Badge>{tRole(review.user.role)}</Badge>
          <span className="break-all text-muted">{review.user.email}</span>
          {fromSchoolEmail ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <Icon name="shield" className="size-3.5" />
              {t("schoolEmail")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
              <Icon name="info" className="size-3.5" />
              {t("notSchoolEmail")}
            </span>
          )}
        </div>

        {avg !== null && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="flex items-center gap-2 text-sm">
              <Stars value={avg} />
              <span className="font-semibold tabular-nums text-foreground">{avg.toFixed(1)}</span>
            </span>
            <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
              {scores.map(([key, score]) => (
                <div key={key} className="flex gap-1">
                  <dt>{tRatings(key)}</dt>
                  <dd className="font-medium tabular-nums text-foreground">{score}/5</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {review.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {review.tags.map((tag) => (
              <Badge key={tag} tone="accent">
                {tTag(tag)}
              </Badge>
            ))}
          </div>
        )}

        <p className="whitespace-pre-line rounded-lg bg-surface-muted p-3.5 text-sm leading-6 text-foreground wrap-anywhere">
          {review.bodyText}
        </p>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
        <p className="text-xs text-subtle">
          {t("submitted", { date: format.dateTime(review.createdAt, { dateStyle: "medium", timeStyle: "short" }) })}
          {review.moderatedAt &&
            ` · ${t("decided", { date: format.dateTime(review.moderatedAt, { dateStyle: "medium" }) })}`}
        </p>
        <div className="flex flex-wrap gap-2">
          {status === "PENDING" && (
            <>
              <ModerationButton
                action={approveReview.bind(null, review.id)}
                label={t("approve")}
                icon="check"
                variant="primary"
              />
              <ModerationButton
                action={rejectReview.bind(null, review.id)}
                label={t("reject")}
                icon="x"
                variant="danger"
              />
            </>
          )}
          {status === "PUBLISHED" && (
            <ModerationButton
              action={rejectReview.bind(null, review.id)}
              label={t("unpublish")}
              icon="x"
              variant="danger"
            />
          )}
          {(status === "REJECTED" || status === "HIDDEN") && (
            <ModerationButton
              action={approveReview.bind(null, review.id)}
              label={t("publish")}
              icon="check"
              variant="secondary"
            />
          )}
        </div>
      </footer>
    </article>
  );
}
