import type { SchoolType } from "@prisma/client";

type BadgeTone = "neutral" | "accent" | "verified" | "pending" | "private" | "international";

type BadgeProps = {
  children: React.ReactNode;
  tone?: BadgeTone;
};

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted text-muted",
  accent: "bg-accent-soft text-accent",
  verified: "bg-ok-soft text-ok",
  pending: "bg-gold-soft text-foreground",
  private: "bg-tone-private-soft text-tone-private",
  international: "bg-tone-intl-soft text-tone-intl",
};

// Each school type is a "line" with its own colour, used on badges, plates and map pins.
export const TYPE_TONE: Record<SchoolType, BadgeTone> = {
  PUBLIC: "accent",
  PRIVATE: "private",
  INTERNATIONAL: "international",
};

/** Solid line colour per school type (plates, dots, route lines). */
export const TYPE_FILL: Record<SchoolType, string> = {
  PUBLIC: "bg-accent",
  PRIVATE: "bg-tone-private",
  INTERNATIONAL: "bg-tone-intl",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
