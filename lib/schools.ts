import { cache } from "react";
import type { Curriculum, Prisma, SchoolLevel, SchoolType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  CURRICULA,
  LEVELS,
  SCHOOL_TYPES,
  SORT_KEYS,
  type SortKey,
} from "@/lib/labels";

// ---------------------------------------------------------------------------
// Search & listing
// ---------------------------------------------------------------------------

export const SEARCH_PAGE_SIZE = 18;

export type SchoolFilters = {
  q?: string;
  level?: SchoolLevel;
  type?: SchoolType;
  curriculum?: Curriculum;
  district?: string;
  dorm: boolean;
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

// Only accept values that really exist, so a bad URL can never crash the query.
function pick<T extends string>(value: string | undefined, allowed: readonly T[]) {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
}

export function parseSchoolFilters(params: RawParams): SchoolFilters {
  return {
    q: first(params.q)?.trim().slice(0, 100) || undefined,
    level: pick(first(params.level), LEVELS),
    type: pick(first(params.type), SCHOOL_TYPES),
    curriculum: pick(first(params.curriculum), CURRICULA),
    district: first(params.district)?.trim() || undefined,
    dorm: first(params.dorm) === "true",
  };
}

export function parseSort(value: string | string[] | undefined): SortKey {
  return pick(first(value), SORT_KEYS) ?? "rating";
}

export function parsePage(value: string | string[] | undefined) {
  const page = Number.parseInt(first(value) ?? "", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function hasActiveFilters(filters: SchoolFilters) {
  const { q, level, type, curriculum, district, dorm } = filters;
  return Boolean(q || level || type || curriculum || district || dorm);
}

// A K–12 school also teaches elementary, middle, and high school, so picking
// "High school" should include it rather than only HIGH-only schools.
const LEVEL_COVERAGE: Record<SchoolLevel, SchoolLevel[]> = {
  ELEMENTARY: ["ELEMENTARY", "K12"],
  MIDDLE: ["MIDDLE", "K12"],
  HIGH: ["HIGH", "K12"],
  K12: ["K12"],
};

function buildSchoolWhere(filters: SchoolFilters): Prisma.SchoolWhereInput {
  const { q, level, type, curriculum, district, dorm } = filters;
  return {
    AND: [
      q
        ? {
            OR: [
              { nameEn: { contains: q, mode: "insensitive" } },
              { nameMn: { contains: q, mode: "insensitive" } },
              { schoolNumber: { contains: q, mode: "insensitive" } },
              { district: { contains: q, mode: "insensitive" } },
              { aimagCity: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      level ? { level: { in: LEVEL_COVERAGE[level] } } : {},
      type ? { type } : {},
      curriculum ? { curriculum: { has: curriculum } } : {},
      district ? { district: { equals: district, mode: "insensitive" } } : {},
      dorm ? { dormitory: { isNot: null } } : {},
    ],
  };
}

// Postgres sorts NULLs first on DESC, which would float unrated schools to
// the top — so NULL averages are pushed explicitly to the end.
const SORT_ORDER: Record<SortKey, Prisma.SchoolOrderByWithRelationInput[]> = {
  rating: [
    { avgOverall: { sort: "desc", nulls: "last" } },
    { reviewCount: "desc" },
    { nameEn: "asc" },
  ],
  reviews: [
    { reviewCount: "desc" },
    { avgOverall: { sort: "desc", nulls: "last" } },
    { nameEn: "asc" },
  ],
  name: [{ nameEn: "asc" }],
  founded: [{ foundedYear: { sort: "asc", nulls: "last" } }, { nameEn: "asc" }],
};

export const schoolCardSelect = {
  id: true,
  nameEn: true,
  nameMn: true,
  schoolNumber: true,
  type: true,
  level: true,
  curriculum: true,
  district: true,
  aimagCity: true,
  logoUrl: true,
  avgOverall: true,
  reviewCount: true,
  tuitionMinAnnual: true,
  tuitionMaxAnnual: true,
  foundedYear: true,
  studentTeacherRatio: true,
  graduateDestinations: true,
  dormitory: { select: { id: true } },
} satisfies Prisma.SchoolSelect;

export type SchoolCardData = Prisma.SchoolGetPayload<{ select: typeof schoolCardSelect }>;

type ListOptions = {
  filters: SchoolFilters;
  sort?: SortKey;
  skip?: number;
  take: number;
};

export function listSchools({ filters, sort = "rating", skip = 0, take }: ListOptions) {
  return prisma.school.findMany({
    where: buildSchoolWhere(filters),
    orderBy: SORT_ORDER[sort],
    skip,
    take,
    select: schoolCardSelect,
  });
}

export async function searchSchools({
  filters,
  sort,
  page,
}: {
  filters: SchoolFilters;
  sort: SortKey;
  page: number;
}) {
  const [schools, total] = await Promise.all([
    listSchools({
      filters,
      sort,
      skip: (page - 1) * SEARCH_PAGE_SIZE,
      take: SEARCH_PAGE_SIZE,
    }),
    prisma.school.count({ where: buildSchoolWhere(filters) }),
  ]);
  return { schools, total };
}

export async function getDistricts() {
  const rows = await prisma.school.groupBy({
    by: ["district"],
    where: { district: { not: null } },
    _count: { _all: true },
    orderBy: { district: "asc" },
  });
  return rows
    .filter((row): row is typeof row & { district: string } => row.district !== null)
    .map((row) => ({ name: row.district, count: row._count._all }));
}

export async function getHomepageData() {
  const [schools, typeRows, districts, recentReviews] = await Promise.all([
    listSchools({ filters: { dorm: false }, take: 6 }),
    prisma.school.groupBy({ by: ["type"], _count: { _all: true } }),
    getDistricts(),
    prisma.review.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        bodyText: true,
        createdAt: true,
        school: { select: { id: true, nameEn: true, nameMn: true } },
        user: { select: { name: true, role: true } },
        rating: { select: { academics: true, facilities: true, teachers: true, environment: true } },
      },
    }),
  ]);

  const typeCounts: Partial<Record<SchoolType, number>> = Object.fromEntries(
    typeRows.map((row) => [row.type, row._count._all])
  );
  // Every school has exactly one type, so the per-type counts sum to the total.
  const totalSchools = typeRows.reduce((sum, row) => sum + row._count._all, 0);

  return { schools, totalSchools, typeCounts, districts, recentReviews };
}

// ---------------------------------------------------------------------------
// School profile
// ---------------------------------------------------------------------------

// Wrapped in cache() because the profile layout, its generateMetadata, and
// the tab pages all ask for it during the same request.
export const getSchoolHeader = cache((id: string) =>
  prisma.school.findUnique({
    where: { id },
    select: {
      id: true,
      nameEn: true,
      nameMn: true,
      schoolNumber: true,
      logoUrl: true,
      coverImageUrl: true,
      type: true,
      level: true,
      aimagCity: true,
      district: true,
      khoroo: true,
      address: true,
      phone: true,
      website: true,
      email: true,
      avgOverall: true,
      reviewCount: true,
      emailDomains: true,
    },
  })
);

const ratingAveragesSelect = {
  avgOverall: true,
  avgAcademics: true,
  avgTeachers: true,
  avgFacilities: true,
  avgEnvironment: true,
  avgLibrary: true,
  avgDorms: true,
  reviewCount: true,
  dormitory: { select: { id: true } },
} satisfies Prisma.SchoolSelect;

export function getSchoolOverview(id: string) {
  return prisma.school.findUnique({
    where: { id },
    select: {
      nameEn: true,
      nameMn: true,
      ...ratingAveragesSelect,
      type: true,
      level: true,
      curriculum: true,
      teachingLanguages: true,
      studentTeacherRatio: true,
      accreditation: true,
      tuitionMinAnnual: true,
      tuitionMaxAnnual: true,
      foundedYear: true,
      graduateDestinations: true,
      notableAchievements: true,
      khoroo: true,
      district: true,
      aimagCity: true,
      latitude: true,
      longitude: true,
      locationApproximate: true,
      address: true,
      phone: true,
      website: true,
      email: true,
    },
  });
}

export function getSchoolRatings(id: string) {
  return prisma.school.findUnique({
    where: { id },
    select: { ...ratingAveragesSelect, emailDomains: true },
  });
}

// ---------------------------------------------------------------------------
// Map
// ---------------------------------------------------------------------------

const mapSchoolSelect = {
  id: true,
  nameEn: true,
  nameMn: true,
  type: true,
  level: true,
  district: true,
  khoroo: true,
  aimagCity: true,
  address: true,
  latitude: true,
  longitude: true,
  locationApproximate: true,
  avgOverall: true,
  reviewCount: true,
} satisfies Prisma.SchoolSelect;

type MapSchoolRow = Prisma.SchoolGetPayload<{ select: typeof mapSchoolSelect }>;
export type MapSchool = MapSchoolRow & { latitude: number; longitude: number };

/** Schools split into those with a pin and those still waiting for coordinates. */
export async function getMapSchools() {
  const rows = await prisma.school.findMany({
    select: mapSchoolSelect,
    orderBy: { nameEn: "asc" },
  });
  const pinned: MapSchool[] = [];
  const unpinned: MapSchoolRow[] = [];
  for (const row of rows) {
    if (row.latitude != null && row.longitude != null) {
      pinned.push({ ...row, latitude: row.latitude, longitude: row.longitude });
    } else {
      unpinned.push(row);
    }
  }
  return { pinned, unpinned };
}

export function getSchoolFacilities(id: string) {
  return prisma.school.findUnique({
    where: { id },
    select: {
      avgFacilities: true,
      avgLibrary: true,
      facilities: {
        select: { id: true, nameEn: true, nameMn: true, category: true, description: true, imageUrl: true },
      },
    },
  });
}

export function getSchoolDormitory(id: string) {
  return prisma.school.findUnique({
    where: { id },
    select: {
      avgDorms: true,
      dormitory: true,
    },
  });
}

export function getSchoolAdmissions(id: string) {
  return prisma.school.findUnique({
    where: { id },
    select: {
      type: true,
      tuitionMinAnnual: true,
      tuitionMaxAnnual: true,
      applicationDeadline: true,
      entranceExamInfo: true,
      catchmentAreaInfo: true,
    },
  });
}

export function getSchoolReviews(id: string) {
  return prisma.review.findMany({
    where: { schoolId: id, status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: {
      rating: true,
      user: { select: { name: true, role: true, isVerified: true } },
    },
  });
}

export async function getIsSchoolSaved(schoolId: string, userId: string | null) {
  if (!userId) return false;
  const row = await prisma.savedSchool.findUnique({
    where: { userId_schoolId: { userId, schoolId } },
    select: { userId: true },
  });
  return Boolean(row);
}

export function getSavedSchoolsForUser(userId: string) {
  return prisma.savedSchool.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { school: { select: schoolCardSelect } },
  });
}
