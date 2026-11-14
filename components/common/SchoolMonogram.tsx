import type { SchoolType } from "@prisma/client";

// White on the line colour in light mode, dark ink on the lighter line colour in dark mode.
const TONE_CLASSES: Record<SchoolType, string> = {
  PUBLIC: "bg-accent text-accent-foreground",
  PRIVATE: "bg-tone-private text-surface",
  INTERNATIONAL: "bg-tone-intl text-surface",
};

const SIZE_CLASSES = {
  md: "size-12 rounded-xl text-base",
  lg: "size-16 rounded-2xl text-xl sm:size-20 sm:text-2xl",
};
const FILLER_WORDS = new Set(["of", "the", "and", "for", "school"]);

function initials(name: string) {
  // Numbered state schools are known by their number ("School No. 14" → "14").
  const number = name.match(/\bNo\.?\s*(\d+)/i);
  if (number) return number[1];

  const words = name.split(/\s+/).filter(Boolean);
  const meaningful = words.filter((w) => !FILLER_WORDS.has(w.toLowerCase()));
  return (meaningful.length > 0 ? meaningful : words)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/**
 * The school's plate: its logo if it has one, otherwise its number or
 * initials on the colour of its line (public, private, international).
 */
export function SchoolMonogram({
  name,
  type,
  logoUrl,
  size = "md",
}: {
  name: string;
  type: SchoolType;
  logoUrl?: string | null;
  size?: keyof typeof SIZE_CLASSES;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- logos are hosted on arbitrary school sites
      <img
        src={logoUrl}
        alt=""
        className={`${SIZE_CLASSES[size]} shrink-0 border border-line bg-surface object-contain p-1.5`}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`${SIZE_CLASSES[size]} ${TONE_CLASSES[type]} flex shrink-0 items-center justify-center font-display font-bold tabular-nums`}
    >
      {initials(name)}
    </span>
  );
}
