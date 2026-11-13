import { test } from "node:test";
import assert from "node:assert/strict";
import { distanceKm, parseNear, roundLocation, schoolDistance } from "@/lib/geo";
import { ratingCategories, reviewAverage, reviewScores } from "@/lib/ratings";
import { safeNextPath } from "@/lib/navigation";

test("roundLocation keeps about 1 km of precision", () => {
  assert.equal(roundLocation({ lat: 47.918532, lng: 106.917701 }), "47.92,106.92");
});

test("parseNear rejects malformed and out-of-range values", () => {
  assert.deepEqual(parseNear("47.92,106.91"), { lat: 47.92, lng: 106.91 });
  assert.deepEqual(parseNear(["47.9,106.9", "0,0"]), { lat: 47.9, lng: 106.9 });
  for (const bad of [undefined, "", "abc", "47.92", "95,10", "10,190"]) assert.equal(parseNear(bad), undefined);
});

test("distanceKm is zero for the same point and about right across Ulaanbaatar", () => {
  const sukhbaatarSquare = { lat: 47.9185, lng: 106.9177 };
  const zaisan = { lat: 47.8864, lng: 106.9155 };
  assert.equal(distanceKm(sukhbaatarSquare, sukhbaatarSquare), 0);
  const d = distanceKm(sukhbaatarSquare, zaisan);
  assert.ok(d > 3.3 && d < 3.8, `expected about 3.6 km, got ${d}`);
});

test("schoolDistance is null without a visitor location or a school pin", () => {
  assert.equal(schoolDistance(undefined, { latitude: 47.9, longitude: 106.9 }), null);
  assert.equal(schoolDistance({ lat: 47.9, lng: 106.9 }, { latitude: null, longitude: 106.9 }), null);
});

test("reviewAverage uses the four required categories", () => {
  assert.equal(reviewAverage({ academics: 5, facilities: 4, teachers: 4, environment: 3 }), 4);
  assert.equal(reviewAverage(null), null);
});

test("reviewScores leaves out optional scores the reviewer skipped", () => {
  const scores = reviewScores({ academics: 5, facilities: 4, teachers: 4, environment: 3, library: null, dorms: 2 });
  assert.deepEqual(scores.map(([key]) => key), ["academics", "teachers", "facilities", "environment", "dorms"]);
});

test("ratingCategories only includes dormitory for schools that have one", () => {
  const averages = { avgAcademics: 4, avgTeachers: 4, avgFacilities: 4, avgEnvironment: 4, avgLibrary: null, avgDorms: 3 };
  assert.equal(ratingCategories(averages, false).some((c) => c.key === "dorms"), false);
  assert.equal(ratingCategories(averages, true).at(-1)?.key, "dorms");
});

test("safeNextPath only allows paths on this site", () => {
  assert.equal(safeNextPath("/saved"), "/saved");
  assert.equal(safeNextPath(["/school/abc/reviews", "/x"]), "/school/abc/reviews");
  for (const bad of [undefined, "", "https://evil.com", "//evil.com", "/\\evil.com", "saved"]) {
    assert.equal(safeNextPath(bad), "/");
  }
});
