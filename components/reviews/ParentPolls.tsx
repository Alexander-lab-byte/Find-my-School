import { useTranslations } from "next-intl";
import type { RatingCategory } from "@/lib/ratings";
import { POLL_MIN } from "@/lib/grades";

type Poll = { key: RatingCategory; pct: number; count: number };

/**
 * "X% of families rate the teachers 4★ or more", built only from published ratings.
 * Thin polls are hidden and we say so, like Niche's "More opinions are needed".
 */
export function ParentPolls({ polls }: { polls: Poll[] }) {
  const t = useTranslations("Polls");
  const tRatings = useTranslations("Ratings");

  if (polls.length === 0) {
    return <p className="rounded-2xl border border-dashed border-line-strong bg-surface p-5 text-sm text-muted">{t("needMore", { min: POLL_MIN })}</p>;
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {polls.map((p) => (
        <li key={p.key} className="plate flex items-center gap-4 p-4">
          <span className="font-display text-3xl font-bold tabular-nums text-foreground">{p.pct}%</span>
          <span className="text-sm leading-5 text-muted">
            {t("agree", { category: tRatings(p.key).toLowerCase() })}
            <span className="block text-xs text-subtle">{t("answers", { count: p.count })}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
