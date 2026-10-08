import type { Curriculum, Prisma, SchoolLevel, SchoolType } from "@prisma/client";
import {
  CURRICULUM_LABELS,
  LEVEL_LABELS,
  SORT_LABELS,
  TYPE_LABELS,
  type SortKey,
} from "@/lib/labels";

export const PAGE_SIZE = 12;

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

// Only accept values that really exist, so a bad URL can never crash the query.
// (hasOwnProperty, not `in` — `in` would also accept things like "constructor".)
function pick<T extends string>(value: string | undefined, allowed: object) {
  return value && Object.prototype.hasOwnProperty.call(allowed, value) ? (value as T) : undefined;
}

/** Turns raw URL params (page or API) into a safe, typed search. */
export function parseSchoolSearch(raw: RawParams) {
  const q = first(raw.q)?.trim().slice(0, 100) || undefined;
  const level = pick<SchoolLevel>(first(raw.level), LEVEL_LABELS);
  const type = pick<SchoolType>(first(raw.type), TYPE_LABELS);
  const curriculum = pick<Curriculum>(first(raw.curriculum), CURRICULUM_LABELS);
  const dorm = first(raw.dorm) === "true";
  const sort = pick<SortKey>(first(raw.sort), SORT_LABELS) ?? "rating";
  const parsedPage = Number.parseInt(first(raw.page) ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  return { q, level, type, curriculum, dorm, sort, page };
}

export type SchoolSearch = ReturnType<typeof parseSchoolSearch>;

export function buildSchoolWhere(search: SchoolSearch): Prisma.SchoolWhereInput {
  const { q, level, type, curriculum, dorm } = search;
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
      level ? { level } : {},
      type ? { type } : {},
      curriculum ? { curriculum: { has: curriculum } } : {},
      dorm ? { dormitory: { isNot: null } } : {},
    ],
  };
}

export function buildSchoolOrderBy(sort: SortKey): Prisma.SchoolOrderByWithRelationInput[] {
  switch (sort) {
    case "reviews":
      return [{ reviewCount: "desc" }, { avgOverall: { sort: "desc", nulls: "last" } }, { nameEn: "asc" }];
    case "name":
      return [{ nameEn: "asc" }];
    default:
      return [{ avgOverall: { sort: "desc", nulls: "last" } }, { reviewCount: "desc" }, { nameEn: "asc" }];
  }
}
