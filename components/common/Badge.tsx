import type { SchoolType } from "@prisma/client";

type BadgeTone = "neutral" | "accent" | "verified" | "pending" | "private" | "international";

type BadgeProps = {
  children: React.ReactNode;
  tone?: BadgeTone;
};

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "border-line bg-surface-muted text-muted",
  accent: "border-transparent bg-accent-soft text-accent",
  verified:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300",
  pending:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300",
  private: "border-transparent bg-tone-private-soft text-tone-private",
  international: "border-transparent bg-tone-intl-soft text-tone-intl",
};

// Each school type gets its own quiet colour, used on badges and monograms.
export const TYPE_TONE: Record<SchoolType, BadgeTone> = {
  PUBLIC: "accent",
  PRIVATE: "private",
  INTERNATIONAL: "international",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
