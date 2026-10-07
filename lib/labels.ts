import type { SchoolType, SchoolLevel, Curriculum, ReviewTag, UserRole } from "@prisma/client";

export const TYPE_LABELS: Record<SchoolType, string> = {
  PUBLIC: "Public",
  PRIVATE: "Private",
  INTERNATIONAL: "International",
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

export function formatTuition(min: number | null, max: number | null) {
  if (!min && !max) return "Free (public school)";
  const fmt = (n: number) => `₮${(n / 1_000_000).toFixed(1)}M`;
  if (min && max && min !== max) return `${fmt(min)}–${fmt(max)} / year`;
  return `${fmt(min ?? max ?? 0)} / year`;
}
