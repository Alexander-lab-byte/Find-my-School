import Link from "next/link";
import { useTranslations } from "next-intl";
import { Stars } from "@/components/common/StarRating";
import { Icon } from "@/components/common/Icon";
import type { RatingCategory } from "@/lib/ratings";

type RatingSummaryProps = {
  overall: number | null;
  count: number;
  categories: { key: RatingCategory; value: number | null }[];
  /** Where "Write the first review" goes when nobody has reviewed yet. */
  writeHref?: string;
};

/** Big overall score beside a bar per category — the school's report card. */
export function RatingSummary({ overall, count, categories, writeHref }: RatingSummaryProps) {
  const t = useTranslations("Ratings");
  const tCommon = useTranslations("Common");
  const hasRatings = count > 0 && Boolean(overall);

  // No reviews yet: an invitation instead of empty stars and dashes.
  if (!hasRatings) {
    return (
      <div className="reveal flex flex-col items-center gap-4 rounded-[1.75rem] border border-dashed border-line-strong bg-surface p-8 text-center sm:flex-row sm:text-left">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <Icon name="message" className="size-5" />
        </span>
        <div className="flex-1">
          <p className="font-display text-lg font-bold text-foreground">{t("emptyTitle")}</p>
          <p className="mt-1 text-sm leading-6 text-muted">{t("emptyBody")}</p>
        </div>
        {writeHref && (
          <Link href={writeHref} className="btn-primary shrink-0">
            {t("emptyCta")}
            <Icon name="arrow-right" className="size-4" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6 reveal rounded-[1.75rem] border border-line bg-surface shadow-[var(--shadow-card)] p-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
      <div className="text-center sm:border-r sm:border-line sm:pr-6">
        <p className="font-display text-5xl font-bold text-foreground">{overall!.toFixed(1)}</p>
        <Stars value={overall} className="mt-2 text-xl" />
        <p className="mt-2 text-sm text-muted">{tCommon("reviewCount", { count })}</p>
      </div>

      <dl className="space-y-3">
        {/* Optional categories nobody rated are left out rather than shown as "—". */}
        {categories
          .filter(({ value }) => Boolean(value))
          .map(({ key, value }) => (
            <div key={key} className="grid grid-cols-[8.5rem_minmax(0,1fr)] items-center gap-3 text-sm">
              <dt className="text-muted">{t(key)}</dt>
              <dd className="flex items-center gap-3">
                <span aria-hidden className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                  <span
                    className="block h-full rounded-full bg-accent"
                    style={{ width: `${(value! / 5) * 100}%` }}
                  />
                </span>
                <span className="w-8 text-right font-medium tabular-nums text-foreground">
                  {value!.toFixed(1)}
                </span>
              </dd>
            </div>
          ))}
      </dl>
    </div>
  );
}
