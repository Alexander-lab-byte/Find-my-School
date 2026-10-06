import type { SchoolType, SchoolLevel, Curriculum, ReviewTag, UserRole } from "@prisma/client";

export const TYPE_LABELS: Record<SchoolType, string> = {
  PUBLIC: "Public",
  PRIVATE: "Private",
  INTERNATIONAL: "International",
};

export const TYPE_DESCRIPTIONS: Record<SchoolType, string> = {
  PUBLIC: "State schools following the national curriculum, free to attend.",
  PRIVATE: "Independent schools with their own programmes and annual tuition.",
  INTERNATIONAL: "Schools teaching international curricula such as IB, Cambridge, or AP.",
};

export const LEVEL_LABELS: Record<SchoolLevel, string> = {
  ELEMENTARY: "Elementary",
  MIDDLE: "Middle school",
  HIGH: "High school",
  K12: "K–12",
};

export const CURRICULUM_LABELS: Record<Curriculum, string> = {
  MONGOLIAN_NATIONAL: "Mongolian National Curriculum",
  CAMBRIDGE: "Cambridge",
  IB: "International Baccalaureate",
  AP: "Advanced Placement",
  DUAL_LANGUAGE: "Dual-language",
};

// Compact forms for cards, where the full names would wrap.
export const CURRICULUM_SHORT_LABELS: Record<Curriculum, string> = {
  MONGOLIAN_NATIONAL: "National curriculum",
  CAMBRIDGE: "Cambridge",
  IB: "IB",
  AP: "AP",
  DUAL_LANGUAGE: "Dual-language",
};

export const LANGUAGE_LABELS: Record<string, string> = {
  mn: "Mongolian",
  en: "English",
  ru: "Russian",
};

export const REVIEW_TAG_LABELS: Record<ReviewTag, string> = {
  DORMITORY: "Dormitory",
  LIBRARY: "Library",
  FOOD_CANTEEN: "Food & Canteen",
  EXTRACURRICULARS: "Extracurriculars",
  ACADEMICS: "Academics",
  FACILITIES: "Facilities",
  TEACHERS: "Teachers",
  ENVIRONMENT: "Environment",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  PARENT: "Parent",
  STUDENT: "Student",
  ALUMNI: "Alumni",
  EDUCATOR: "Educator",
  ADMIN: "Admin",
};

export const SORT_LABELS = {
  rating: "Top rated",
  reviews: "Most reviewed",
  name: "Name (A–Z)",
};

export type SortKey = keyof typeof SORT_LABELS;

export function formatTuition(min: number | null, max: number | null) {
  if (!min && !max) return "Not reported";
  const fmt = (n: number) => `₮${(n / 1_000_000).toFixed(1)}M`;
  if (min && max && min !== max) return `${fmt(min)}–${fmt(max)} / year`;
  return `${fmt(min ?? max ?? 0)} / year`;
}

/** Short tuition line for cards and fact lists. */
export function tuitionSummary(type: SchoolType, min: number | null, max: number | null) {
  if (type === "PUBLIC") return "Free (public school)";
  if (!min && !max) return "Fees not listed";
  return formatTuition(min, max);
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
