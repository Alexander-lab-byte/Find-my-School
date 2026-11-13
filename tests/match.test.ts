import { test } from "node:test";
import assert from "node:assert/strict";
import { budgetFilter, parseMatchAnswers, rankSchools, type MatchAnswers } from "@/lib/match";
import type { SchoolCardData } from "@/lib/schools";

/** A school with sensible defaults; each test overrides what it cares about. */
function school(overrides: Partial<SchoolCardData> & { nameEn: string }): SchoolCardData {
  return {
    id: overrides.nameEn,
    nameMn: null,
    schoolNumber: null,
    type: "PRIVATE",
    level: "K12",
    curriculum: [],
    district: null,
    aimagCity: "Ulaanbaatar",
    logoUrl: null,
    coverImageUrl: null,
    avgOverall: null,
    reviewCount: 0,
    tuitionMinAnnual: null,
    tuitionMaxAnnual: null,
    foundedYear: null,
    studentTeacherRatio: null,
    graduateDestinations: [],
    teachingLanguages: [],
    latitude: null,
    longitude: null,
    dormitory: null,
    ...overrides,
  };
}

const base: MatchAnswers = { level: "HIGH", budget: "any", goal: "abroad", dorm: false };

test("parseMatchAnswers needs level, budget and goal", () => {
  assert.equal(parseMatchAnswers({ level: "HIGH", budget: "any" }), null);
  assert.equal(parseMatchAnswers({ level: "NOPE", budget: "any", goal: "abroad" }), null);
  assert.deepEqual(parseMatchAnswers({ level: "HIGH", budget: "25m", goal: "japan", dorm: "true", near: "47.92,106.91" }), {
    level: "HIGH",
    budget: "25m",
    goal: "japan",
    dorm: true,
    district: undefined,
    near: { lat: 47.92, lng: 106.91 },
    priority: undefined,
  });
});

test("parseMatchAnswers ignores an unknown priority and trims the district", () => {
  const answers = parseMatchAnswers({ level: "MIDDLE", budget: "free", goal: "unsure", priority: "magic", district: "  Khan-Uul " });
  assert.equal(answers?.priority, undefined);
  assert.equal(answers?.district, "Khan-Uul");
});

test("budgetFilter turns 'any' into no limit", () => {
  assert.equal(budgetFilter("any"), undefined);
  assert.equal(budgetFilter("10m"), "10m");
});

test("a university-abroad goal ranks international curricula in English first", () => {
  const ranked = rankSchools(
    [
      school({ nameEn: "National", curriculum: ["MONGOLIAN_NATIONAL"], teachingLanguages: ["mn"] }),
      school({ nameEn: "IB English", curriculum: ["IB"], teachingLanguages: ["en"] }),
      school({ nameEn: "English only", teachingLanguages: ["en"] }),
    ],
    base
  );
  assert.deepEqual(ranked.map((r) => r.school.nameEn), ["IB English", "English only", "National"]);
  const top = ranked[0];
  assert.deepEqual(top.reasons.find((r) => r.key === "internationalCurriculum")?.curricula, ["IB"]);
  assert.ok(top.reasons.some((r) => r.key === "teachesEnglish"));
  assert.ok(top.percent > ranked[1].percent);
});

test("unverified graduate destinations never affect the score", () => {
  const plain = school({ nameEn: "A", curriculum: ["IB"] });
  const boastful = school({ nameEn: "B", curriculum: ["IB"], graduateDestinations: ["Harvard", "MIT"] });
  const [first, second] = rankSchools([plain, boastful], base);
  assert.equal(first.score, second.score);
});

test("reviews count, and count double when they matter most", () => {
  const rated = school({ nameEn: "Rated", avgOverall: 5, reviewCount: 3 });
  const unrated = school({ nameEn: "Unrated" });
  const normal = rankSchools([unrated, rated], { ...base, goal: "unsure" });
  assert.equal(normal[0].school.nameEn, "Rated");
  assert.ok(normal[1].cautions.some((c) => c.key === "noReviews"));
  const boosted = rankSchools([rated], { ...base, goal: "unsure", priority: "reviews" });
  assert.equal(boosted[0].score, normal[0].score * 2);
});

test("distance: nearer schools score higher, schools without a pin get a caution", () => {
  const near = { lat: 47.92, lng: 106.92 };
  const ranked = rankSchools(
    [
      school({ nameEn: "Far", latitude: 47.7, longitude: 106.5 }),
      school({ nameEn: "Close", latitude: 47.921, longitude: 106.921 }),
      school({ nameEn: "No pin" }),
    ],
    { ...base, goal: "unsure", near }
  );
  assert.equal(ranked[0].school.nameEn, "Close");
  assert.ok(ranked[0].reasons.some((r) => r.key === "near"));
  assert.ok(ranked.find((r) => r.school.nameEn === "No pin")?.cautions.some((c) => c.key === "noPin"));
});

test("a chosen district only counts when no location was shared", () => {
  const inDistrict = school({ nameEn: "In", district: "Khan-Uul" });
  const [result] = rankSchools([inDistrict], { ...base, goal: "unsure", district: "khan-uul" });
  assert.ok(result.reasons.some((r) => r.key === "inDistrict"));
});

test("cost priority puts free public schools first and flags unknown fees", () => {
  const ranked = rankSchools(
    [
      school({ nameEn: "Pricey", tuitionMinAnnual: 45_000_000 }),
      school({ nameEn: "Public", type: "PUBLIC" }),
      school({ nameEn: "Unknown fee" }),
    ],
    { ...base, goal: "unsure", priority: "cost" }
  );
  assert.equal(ranked[0].school.nameEn, "Public");
  assert.ok(ranked.find((r) => r.school.nameEn === "Unknown fee")?.cautions.some((c) => c.key === "feeUnknown"));
});

test("percent stays between 0 and 100 and ties sort by name", () => {
  const ranked = rankSchools([school({ nameEn: "Zed" }), school({ nameEn: "Alpha" })], base);
  assert.deepEqual(ranked.map((r) => r.school.nameEn), ["Alpha", "Zed"]);
  for (const r of ranked) assert.ok(r.percent >= 0 && r.percent <= 100);
});
