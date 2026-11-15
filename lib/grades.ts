import type { RatingCategory } from "@/lib/ratings";

/**
 * Report-card letter grade from a 1–5 star average, like the A+…F grades on Niche.
 * Our own scale: every quarter star is one step, so 5★ = A+, 4★ = B+, 3★ = C, under 2★ = F.
 */
const SCALE: [min: number, grade: string][] = [
  [4.75, "A+"],
  [4.5, "A"],
  [4.25, "A-"],
  [4, "B+"],
  [3.75, "B"],
  [3.5, "B-"],
  [3.25, "C+"],
  [3, "C"],
  [2.75, "C-"],
  [2, "D"],
];

export function letterGrade(avg: number | null | undefined): string | null {
  if (avg == null || !Number.isFinite(avg) || avg <= 0) return null;
  return SCALE.find(([min]) => avg >= min)?.[1] ?? "F";
}

/** Grade colour group, so A's, B's and the rest read at a glance (never colour alone: the letter is the meaning). */
export function gradeTone(grade: string): "good" | "fair" | "low" {
  return grade.startsWith("A") ? "good" : grade.startsWith("B") ? "fair" : "low";
}

/** Fewer ratings than this and a poll is not shown ("more opinions are needed"), like Niche's student polls. */
export const POLL_MIN = 3;

type PollRating = Partial<Record<RatingCategory, number | null>>;

/**
 * Parent polls built from real ratings: the share of reviewers who gave a category 4★ or more.
 * Categories with fewer than POLL_MIN answers are left out.
 */
export function parentPolls(ratings: PollRating[], keys: RatingCategory[]) {
  return keys
    .map((key) => {
      const answers = ratings.map((r) => r[key]).filter((v): v is number => typeof v === "number");
      const agree = answers.filter((v) => v >= 4).length;
      return { key, count: answers.length, pct: answers.length ? Math.round((agree / answers.length) * 100) : 0 };
    })
    .filter((p) => p.count >= POLL_MIN);
}
