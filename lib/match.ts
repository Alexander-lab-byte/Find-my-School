import type { Curriculum, SchoolLevel } from "@prisma/client";
import { BUDGETS, type BudgetKey } from "@/lib/labels";
import { parseNear, schoolDistance, type LatLng } from "@/lib/geo";
import type { SchoolCardData } from "@/lib/schools";

/**
 * "Find my match": a family answers a few questions about their child, and
 * every school gets a score with plain reasons ("Teaches in English",
 * "2.1 km from you"). Only facts we actually store are used — never the
 * unverified graduate-destination claims.
 *
 * Answers live in the URL, so results can be shared or bookmarked.
 */

export const MATCH_LEVELS = ["ELEMENTARY", "MIDDLE", "HIGH"] as const satisfies readonly SchoolLevel[];
export const MATCH_BUDGETS = [...BUDGETS, "any"] as const;
export const MATCH_GOALS = ["abroad", "mongolia", "japan", "unsure"] as const;
export const MATCH_PRIORITIES = ["reviews", "cost", "close", "english"] as const;

export type MatchBudget = (typeof MATCH_BUDGETS)[number];
export type MatchGoal = (typeof MATCH_GOALS)[number];
export type MatchPriority = (typeof MATCH_PRIORITIES)[number];

export type MatchAnswers = {
  level: (typeof MATCH_LEVELS)[number];
  budget: MatchBudget;
  goal: MatchGoal;
  dorm: boolean;
  district?: string;
  near?: LatLng;
  priority?: MatchPriority;
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function pick<T extends string>(value: string | undefined, allowed: readonly T[]) {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
}

/** The answers in the URL, or null when the quiz hasn't been finished. */
export function parseMatchAnswers(params: RawParams): MatchAnswers | null {
  const level = pick(first(params.level), MATCH_LEVELS);
  const budget = pick(first(params.budget), MATCH_BUDGETS);
  const goal = pick(first(params.goal), MATCH_GOALS);
  if (!level || !budget || !goal) return null;
  return {
    level,
    budget,
    goal,
    dorm: first(params.dorm) === "true",
    district: first(params.district)?.trim().slice(0, 60) || undefined,
    near: parseNear(params.near),
    priority: pick(first(params.priority), MATCH_PRIORITIES),
  };
}

/** Budget for the shared search filters; "any" means no limit. */
export function budgetFilter(budget: MatchBudget): BudgetKey | undefined {
  return budget === "any" ? undefined : budget;
}

/**
 * A reason is a translation key in the "MatchReason" namespace plus its
 * values, so the page can show it in either language.
 */
export type MatchReason = {
  key: string;
  values?: Record<string, string | number>;
  /** Curricula to name in the sentence; the page writes them in the reader's language. */
  curricula?: Curriculum[];
};

export type MatchResult = {
  school: SchoolCardData;
  score: number;
  /** 0–100, relative to the best possible score for these answers. */
  percent: number;
  reasons: MatchReason[];
  /** Things to check before deciding. */
  cautions: MatchReason[];
  distanceKm: number | null;
};

const ABROAD_CURRICULA = new Set(["IB", "CAMBRIDGE", "AP"]);

/**
 * Score one school. Schools have already been filtered by level, budget and
 * dormitory, so this only ranks what's left. Weights are simple on purpose:
 * a family should be able to understand why a school is first.
 */
function scoreSchool(school: SchoolCardData, answers: MatchAnswers) {
  const reasons: MatchReason[] = [];
  const cautions: MatchReason[] = [];
  const boost = (p: MatchPriority) => (answers.priority === p ? 2 : 1);
  let score = 0;
  let max = 0;

  const teaches = (lang: string) => school.teachingLanguages.includes(lang);
  const abroadCurricula = school.curriculum.filter((c) => ABROAD_CURRICULA.has(c));

  // 1. Goal after school (up to 30).
  max += 30;
  if (answers.goal === "abroad") {
    if (abroadCurricula.length > 0) {
      score += 20;
      reasons.push({ key: "internationalCurriculum", curricula: abroadCurricula });
    }
    if (teaches("en")) {
      score += 10;
      reasons.push({ key: "teachesEnglish" });
    }
  } else if (answers.goal === "mongolia") {
    if (school.curriculum.includes("MONGOLIAN_NATIONAL")) {
      score += 20;
      reasons.push({ key: "nationalCurriculum" });
    }
    if (teaches("mn")) score += 10;
  } else if (answers.goal === "japan") {
    if (teaches("ja")) {
      score += 30;
      reasons.push({ key: "teachesJapanese" });
    }
  } else {
    // Not sure yet: keep doors open — a school with more than one track helps.
    if (school.curriculum.length > 1 || school.teachingLanguages.length > 1) {
      score += 15;
      reasons.push({ key: "flexible" });
    }
  }

  // 2. Strong English, when that's what matters most (up to 20).
  if (answers.priority === "english") {
    max += 20;
    if (teaches("en")) {
      score += 20;
      if (!reasons.some((r) => r.key === "teachesEnglish")) reasons.push({ key: "teachesEnglish" });
    }
  }

  // 3. Location (up to 20, doubled when closeness matters most).
  const distanceKm = schoolDistance(answers.near, school);
  if (answers.near) {
    max += 20 * boost("close");
    if (distanceKm != null) {
      const points = distanceKm <= 3 ? 20 : distanceKm <= 7 ? 12 : distanceKm <= 15 ? 5 : 0;
      score += points * boost("close");
      if (points > 0) {
        reasons.push({ key: "near", values: { km: distanceKm < 10 ? distanceKm.toFixed(1) : Math.round(distanceKm) } });
      }
    } else {
      cautions.push({ key: "noPin" });
    }
  } else if (answers.district) {
    max += 20 * boost("close");
    if (school.district?.toLowerCase() === answers.district.toLowerCase()) {
      score += 20 * boost("close");
      reasons.push({ key: "inDistrict" });
    }
  }

  // 4. What families say (up to 20, doubled when reviews matter most).
  max += 20 * boost("reviews");
  if (school.reviewCount > 0 && school.avgOverall) {
    score += (school.avgOverall / 5) * 20 * boost("reviews");
    reasons.push({
      key: "rated",
      values: { rating: school.avgOverall.toFixed(1), count: school.reviewCount },
    });
  } else {
    cautions.push({ key: "noReviews" });
  }

  // 5. Cost, when it matters most (up to 20).
  if (answers.priority === "cost") {
    max += 20;
    if (school.type === "PUBLIC") {
      score += 20;
      reasons.push({ key: "free" });
    } else if (school.tuitionMinAnnual) {
      // ₮0 → 20 points, ₮50M or more → 0.
      score += Math.max(0, 20 * (1 - school.tuitionMinAnnual / 50_000_000));
    }
  } else if (school.type === "PUBLIC") {
    reasons.push({ key: "free" });
  }

  // Facts the family already asked for: confirm them.
  if (answers.dorm) reasons.push({ key: "dorm" });

  if (school.type !== "PUBLIC" && !school.tuitionMinAnnual && !school.tuitionMaxAnnual) {
    cautions.push({ key: "feeUnknown" });
  }

  return { score, max, reasons, cautions, distanceKm };
}

/** Ranks the (already filtered) schools for these answers, best first. */
export function rankSchools(schools: SchoolCardData[], answers: MatchAnswers): MatchResult[] {
  return schools
    .map((school) => {
      const { score, max, reasons, cautions, distanceKm } = scoreSchool(school, answers);
      return {
        school,
        score,
        percent: max > 0 ? Math.round((score / max) * 100) : 0,
        reasons,
        cautions,
        distanceKm,
      };
    })
    .sort((a, b) => b.score - a.score || a.school.nameEn.localeCompare(b.school.nameEn));
}
