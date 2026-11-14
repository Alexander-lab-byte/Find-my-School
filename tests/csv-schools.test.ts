import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CSV_COLUMNS, parseCsv, readSchoolsCsv } from "@/prisma/csv-schools";

const header = CSV_COLUMNS.join(",");
/** One CSV row from a few named values; every other column is left empty. */
function row(values: Partial<Record<(typeof CSV_COLUMNS)[number], string>>) {
  return CSV_COLUMNS.map((col) => {
    const value = values[col] ?? "";
    return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  }).join(",");
}

test("parseCsv handles quotes, commas and line breaks inside a cell", () => {
  assert.deepEqual(parseCsv('a,b\n"x, y","say ""hi"""\n'), [
    ["a", "b"],
    ["x, y", 'say "hi"'],
  ]);
});

test("an empty file and a missing column are reported, not crashed on", () => {
  assert.ok(readSchoolsCsv("").errors.length > 0);
  const { errors } = readSchoolsCsv("nameEn,type\nTest,PUBLIC\n");
  assert.ok(errors.some((e) => e.message.includes("missing")));
});

test("a valid row becomes a school", () => {
  const csv = `${header}\n${row({ nameEn: "Test School", type: "PRIVATE", level: "K12", aimagCity: "Ulaanbaatar", district: "Khan-Uul", tuitionMinAnnual: "12000000", teachingLanguages: "mn|en" })}\n`;
  const { schools, errors } = readSchoolsCsv(csv);
  assert.deepEqual(errors, []);
  assert.equal(schools.length, 1);
  assert.equal(schools[0].nameEn, "Test School");
  assert.equal(schools[0].tuitionMinAnnual, 12_000_000);
});

test("a bad type is reported with its row number", () => {
  const csv = `${header}\n${row({ nameEn: "Bad", type: "CHARTER", level: "K12", aimagCity: "Ulaanbaatar" })}\n`;
  const { schools, errors } = readSchoolsCsv(csv);
  assert.equal(schools.length, 0);
  assert.ok(errors.some((e) => e.row === 2 && e.column === "type"));
});

test("the real Ulaanbaatar data file imports with no errors", () => {
  const { schools, errors } = readSchoolsCsv(readFileSync("prisma/data/ub-schools-2026-11.csv", "utf8"));
  assert.deepEqual(errors, []);
  assert.ok(schools.length >= 100);
});
