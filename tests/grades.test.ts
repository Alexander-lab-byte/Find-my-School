import { test } from "node:test";
import assert from "node:assert/strict";
import { letterGrade, gradeTone, parentPolls, POLL_MIN } from "@/lib/grades";

test("letterGrade maps a 1-5 average onto A+ to F", () => {
  assert.equal(letterGrade(5), "A+");
  assert.equal(letterGrade(4.75), "A+");
  assert.equal(letterGrade(4.74), "A");
  assert.equal(letterGrade(4), "B+");
  assert.equal(letterGrade(3), "C");
  assert.equal(letterGrade(2), "D");
  assert.equal(letterGrade(1.9), "F");
});

test("letterGrade gives no grade when there is no rating", () => {
  assert.equal(letterGrade(null), null);
  assert.equal(letterGrade(0), null);
  assert.equal(letterGrade(Number.NaN), null);
});

test("gradeTone groups A, B and the rest", () => {
  assert.equal(gradeTone("A-"), "good");
  assert.equal(gradeTone("B+"), "fair");
  assert.equal(gradeTone("C"), "low");
});

test("parentPolls counts 4 stars or more and hides thin polls", () => {
  const ratings = [
    { teachers: 5, academics: 3, library: null },
    { teachers: 4, academics: 4, library: 5 },
    { teachers: 2, academics: 5, library: null },
    { teachers: 4, academics: 1 },
  ];
  const polls = parentPolls(ratings, ["teachers", "academics", "library"]);
  assert.deepEqual(polls, [
    { key: "teachers", count: 4, pct: 75 },
    { key: "academics", count: 4, pct: 50 },
  ]);
  assert.ok(POLL_MIN > 1);
});
