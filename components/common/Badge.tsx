import type { SchoolType } from "@prisma/client";

type BadgeTone = "neutral" | "accent" | "verified" | "private" | "international";

type BadgeProps = {
  children: React.ReactNode;
  tone?: BadgeTone;
};

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral:
    "border-line bg-surface-muted text-muted",
  accent:
    "border-transparent bg-accent-soft text-accent",
  verified:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300",
  private:
    "border-transparent bg-tone-private-soft text-tone-private",
  international:
    "border-transparent bg-tone-international-soft text-tone-international",
};

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