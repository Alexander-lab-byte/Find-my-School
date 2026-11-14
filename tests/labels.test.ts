import { test } from "node:test";
import assert from "node:assert/strict";
import { displayUrl, externalUrl, formatLocation, formatTuition, placeName, schoolNames, tuitionSummary } from "@/lib/labels";

/** Stand-in for a next-intl translator: echoes the key and its values. */
function translator(known: string[] = []) {
  const t = (key: string, values?: Record<string, string | number>) =>
    values ? `${key}(${Object.values(values).join(",")})` : key;
  t.has = (key: string) => known.includes(key);
  return t;
}

test("externalUrl adds a protocol only when one is missing", () => {
  assert.equal(externalUrl("www.school.mn"), "https://www.school.mn");
  assert.equal(externalUrl("http://school.mn"), "http://school.mn");
  assert.equal(externalUrl(null), null);
  assert.equal(externalUrl(""), null);
});

test("displayUrl strips the protocol and a trailing slash", () => {
  assert.equal(displayUrl("https://www.school.mn/"), "www.school.mn");
});

test("formatTuition shows a range, a single fee, or 'not reported'", () => {
  const t = translator();
  assert.equal(formatTuition(t, 23_000_000, 36_000_000), "range(23.0,36.0)");
  assert.equal(formatTuition(t, 15_000_000, 15_000_000), "single(15.0)");
  assert.equal(formatTuition(t, null, 8_500_000), "single(8.5)");
  assert.equal(formatTuition(t, null, null), "notReported");
});

test("tuitionSummary: public schools are free, unknown private fees say so", () => {
  const t = translator();
  assert.equal(tuitionSummary(t, "PUBLIC", null, null), "free");
  assert.equal(tuitionSummary(t, "PRIVATE", null, null), "notListed");
  assert.equal(tuitionSummary(t, "INTERNATIONAL", 72_000_000, null), "single(72.0)");
});

test("placeName falls back to the stored name when there is no translation", () => {
  assert.equal(placeName(translator(["Khan-Uul"]), "Khan-Uul"), "Khan-Uul");
  assert.equal(placeName(translator(), "Somewhere new"), "Somewhere new");
});

test("formatLocation joins khoroo, district and city, skipping what is missing", () => {
  const t = translator();
  assert.equal(formatLocation(t, { khoroo: "3", district: "Khan-Uul", aimagCity: "Ulaanbaatar" }), "khoroo(3), Khan-Uul, Ulaanbaatar");
  assert.equal(formatLocation(t, { district: null, aimagCity: "Darkhan" }), "Darkhan");
});

test("schoolNames leads with the reader's language", () => {
  const school = { nameEn: "School No. 5", nameMn: "5-р сургууль" };
  assert.deepEqual(schoolNames(school, "mn"), { primary: "5-р сургууль", secondary: "School No. 5" });
  assert.deepEqual(schoolNames(school, "en"), { primary: "School No. 5", secondary: "5-р сургууль" });
  // A Mongolian name that only repeats the English one is dropped.
  assert.deepEqual(schoolNames({ nameEn: "Hobby", nameMn: "Hobby" }, "mn"), { primary: "Hobby", secondary: null });
});
