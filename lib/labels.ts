import type { SchoolType, SchoolLevel, Curriculum, ReviewTag } from "@prisma/client";

// Display text for all of these lives in messages/{en,mn}.json under the
// matching namespace (SchoolType, Level, Curriculum, ReviewTag, Sort…).
// These lists are the source of truth for which values exist and in what
// order filters show them.

export const SCHOOL_TYPES: SchoolType[] = ["PUBLIC", "PRIVATE", "INTERNATIONAL"];

export const LEVELS: SchoolLevel[] = ["ELEMENTARY", "MIDDLE", "HIGH", "K12"];

export const CURRICULA: Curriculum[] = [
  "MONGOLIAN_NATIONAL",
  "CAMBRIDGE",
  "IB",
  "AP",
  "DUAL_LANGUAGE",
];

export const REVIEW_TAGS: ReviewTag[] = [
  "DORMITORY",
  "LIBRARY",
  "FOOD_CANTEEN",
  "EXTRACURRICULARS",
  "ACADEMICS",
  "FACILITIES",
  "TEACHERS",
  "ENVIRONMENT",
];

export const SORT_KEYS = ["rating", "reviews", "name", "founded"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

/** A next-intl translator scoped to one namespace (from useTranslations or getTranslations). */
type Translate = {
  (key: string, values?: Record<string, string | number>): string;
  has(key: string): boolean;
};

const millions = (n: number) => (n / 1_000_000).toFixed(1);

/** Annual fee range; `t` is scoped to the "Tuition" namespace. */
export function formatTuition(t: Translate, min: number | null, max: number | null) {
  if (!min && !max) return t("notReported");
  if (min && max && min !== max) return t("range", { min: millions(min), max: millions(max) });
  return t("single", { amount: millions(min ?? max ?? 0) });
}

/** Short tuition line for cards and fact lists; `t` is scoped to "Tuition". */
export function tuitionSummary(
  t: Translate,
  type: SchoolType,
  min: number | null,
  max: number | null
) {
  if (type === "PUBLIC") return t("free");
  if (!min && !max) return t("notListed");
  return formatTuition(t, min, max);
}

/** Translated district/city name when known, else as stored; `t` is scoped to "Place". */
export function placeName(t: Translate, name: string) {
  return t.has(name) ? t(name) : name;
}

/** "Khoroo 3, Khan-Uul, Ulaanbaatar" in the active language; `t` is scoped to "Place". */
export function formatLocation(
  t: Translate,
  school: { khoroo?: string | null; district: string | null; aimagCity: string }
) {
  return [
    school.khoroo && t("khoroo", { number: school.khoroo }),
    school.district && placeName(t, school.district),
    placeName(t, school.aimagCity),
  ]
    .filter(Boolean)
    .join(", ");
}

/**
 * Which name leads. In Mongolian the Mongolian name is the title and the
 * English one the subtitle, and vice versa. A Mongolian name that only
 * repeats the English one is ignored.
 */
export function schoolNames(school: { nameEn: string; nameMn: string | null }, locale: string) {
  const nameMn = school.nameMn && school.nameMn !== school.nameEn ? school.nameMn : null;
  if (locale === "mn" && nameMn) return { primary: nameMn, secondary: school.nameEn };
  return { primary: school.nameEn, secondary: nameMn };
}
