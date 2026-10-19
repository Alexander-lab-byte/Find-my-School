import type { SchoolType } from "@prisma/client";

type BadgeTone = "neutral" | "accent" | "verified" | "pending" | "private" | "international";

type BadgeProps = {
  children: React.ReactNode;
  tone?: BadgeTone;
};

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "border-line bg-surface-muted text-muted",
  accent: "border-transparent bg-accent-soft text-accent",
  verified: "border-good/30 bg-good-soft text-good",
  pending: "border-accent/30 bg-accent-soft text-accent",
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
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
