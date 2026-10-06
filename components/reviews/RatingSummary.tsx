import { Stars } from "@/components/common/StarRating";

type RatingSummaryProps = {
  overall: number | null;
  count: number;
  categories: { label: string; value: number | null }[];
};

/** Big overall score beside a bar per category — the school's report card. */
export function RatingSummary({ overall, count, categories }: RatingSummaryProps) {
  const hasRatings = count > 0 && Boolean(overall);

  return (
    <div className="grid gap-6 rounded-xl border border-line bg-surface p-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
      <div className="text-center sm:border-r sm:border-line sm:pr-6">
        <p className="font-display text-5xl font-semibold text-foreground">
          {hasRatings ? overall!.toFixed(1) : "—"}
        </p>
        <Stars value={hasRatings ? overall : 0} className="mt-2 text-xl" />
        <p className="mt-2 text-sm text-muted">
          {hasRatings ? `${count} ${count === 1 ? "review" : "reviews"}` : "No reviews yet"}
        </p>
      </div>

      <dl className="space-y-3">
        {categories.map(({ label, value }) => {
          const score = hasRatings && value ? value : null;
          return (
            <div key={label} className="grid grid-cols-[8.5rem_minmax(0,1fr)] items-center gap-3 text-sm">
              <dt className="text-muted">{label}</dt>
              <dd className="flex items-center gap-3">
                <span aria-hidden className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                  <span
                    className="block h-full rounded-full bg-accent"
                    style={{ width: `${score ? (score / 5) * 100 : 0}%` }}
                  />
                </span>
                <span className="w-8 text-right font-medium tabular-nums text-foreground">
                  {score ? score.toFixed(1) : "—"}
                </span>
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
