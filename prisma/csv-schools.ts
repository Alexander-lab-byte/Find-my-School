import { Curriculum, SchoolLevel, SchoolType } from "@prisma/client";

/**
 * Turns a schools spreadsheet (saved as CSV from Google Sheets or Excel)
 * into checked school records. Pure functions only — no database — so the
 * team can run a dry run and fix every error before anything is written.
 *
 * Rules:
 * - One row per school. `nameEn` is the key: a row updates the school with
 *   the same English name, or creates a new one.
 * - Empty cells are left out, so a blank cell never wipes data that's
 *   already in the database.
 * - Lists (curriculum, teachingLanguages, emailDomains) are separated by "|".
 */

export const CSV_COLUMNS = [
  "nameEn",
  "nameMn",
  "schoolNumber",
  "type",
  "level",
  "curriculum",
  "teachingLanguages",
  "aimagCity",
  "district",
  "khoroo",
  "address",
  "latitude",
  "longitude",
  "locationApproximate",
  "phone",
  "email",
  "website",
  "tuitionMinAnnual",
  "tuitionMaxAnnual",
  "foundedYear",
  "studentTeacherRatio",
  "hasDormitory",
  "emailDomains",
  "source",
] as const;

type Column = (typeof CSV_COLUMNS)[number];

const REQUIRED: Column[] = ["nameEn", "type", "level"];

/** Ulaanbaatar's districts as stored in the database (and translated in messages/). */
export const UB_DISTRICTS = [
  "Baganuur",
  "Bagakhangai",
  "Bayangol",
  "Bayanzurkh",
  "Chingeltei",
  "Khan-Uul",
  "Nalaikh",
  "Songinokhairkhan",
  "Sukhbaatar",
];

/** Common spellings people type, mapped to the stored name. */
const DISTRICT_ALIASES: Record<string, string> = {
  "хан-уул": "Khan-Uul",
  "хан уул": "Khan-Uul",
  "khan uul": "Khan-Uul",
  "khanuul": "Khan-Uul",
  "баянзүрх": "Bayanzurkh",
  "bayanzurkh": "Bayanzurkh",
  "bayanzurh": "Bayanzurkh",
  "сүхбаатар": "Sukhbaatar",
  "suhbaatar": "Sukhbaatar",
  "баянгол": "Bayangol",
  "чингэлтэй": "Chingeltei",
  "chingeltei": "Chingeltei",
  "сонгинохайрхан": "Songinokhairkhan",
  "songino khairkhan": "Songinokhairkhan",
  "songinohairhan": "Songinokhairkhan",
  "налайх": "Nalaikh",
  "nalaih": "Nalaikh",
  "багануур": "Baganuur",
  "багахангай": "Bagakhangai",
};

export type CsvSchool = {
  nameEn: string;
  nameMn?: string;
  schoolNumber?: string;
  type: SchoolType;
  level: SchoolLevel;
  curriculum?: Curriculum[];
  teachingLanguages?: string[];
  aimagCity?: string;
  district?: string;
  khoroo?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  locationApproximate?: boolean;
  phone?: string;
  email?: string;
  website?: string;
  tuitionMinAnnual?: number;
  tuitionMaxAnnual?: number;
  foundedYear?: number;
  studentTeacherRatio?: string;
  hasDormitory?: boolean;
  emailDomains?: string[];
};

export type RowProblem = { row: number; column?: string; message: string };

/** Minimal RFC 4180 CSV reader: quotes, escaped quotes (""), commas and newlines inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const input = text.replace(/^﻿/, ""); // Excel adds a BOM

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && input[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  // Drop fully empty lines (common at the end of exported sheets).
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const list = (value: string) =>
  value
    .split("|")
    .map((v) => v.trim())
    .filter(Boolean);

const YES = new Set(["yes", "true", "1", "тийм", "y"]);
const NO = new Set(["no", "false", "0", "үгүй", "n"]);

/**
 * Checks every row. Returns the good records plus every problem found, with
 * spreadsheet row numbers (row 1 is the header), so they're easy to find.
 */
export function readSchoolsCsv(text: string): {
  schools: CsvSchool[];
  errors: RowProblem[];
  warnings: RowProblem[];
} {
  const rows = parseCsv(text);
  const errors: RowProblem[] = [];
  const warnings: RowProblem[] = [];
  const schools: CsvSchool[] = [];

  if (rows.length === 0) {
    errors.push({ row: 1, message: "The file is empty." });
    return { schools, errors, warnings };
  }

  const header = rows[0].map((h) => h.trim());
  const unknown = header.filter((h) => h && !(CSV_COLUMNS as readonly string[]).includes(h));
  for (const h of unknown) warnings.push({ row: 1, column: h, message: "Unknown column, ignored." });
  for (const col of REQUIRED) {
    if (!header.includes(col)) errors.push({ row: 1, column: col, message: "Required column is missing." });
  }
  if (errors.length > 0) return { schools, errors, warnings };

  const seenNames = new Map<string, number>();

  rows.slice(1).forEach((cells, index) => {
    const rowNumber = index + 2;
    const raw = (col: Column) => {
      const i = header.indexOf(col);
      return i === -1 ? "" : (cells[i] ?? "").trim();
    };
    const rowErrors: RowProblem[] = [];
    const fail = (column: Column, message: string) => rowErrors.push({ row: rowNumber, column, message });
    const warn = (column: Column, message: string) => warnings.push({ row: rowNumber, column, message });

    const int = (col: Column, min: number, max: number) => {
      const value = raw(col).replace(/[\s,'_₮]/g, "");
      if (!value) return undefined;
      // Allow "25M" / "25m" for millions, since fees are usually written that way.
      const millions = /^(\d+(\.\d+)?)m$/i.exec(value);
      const n = millions ? Math.round(Number(millions[1]) * 1_000_000) : Number(value);
      if (!Number.isInteger(n) || n < min || n > max) {
        fail(col, `"${raw(col)}" should be a whole number between ${min} and ${max}.`);
        return undefined;
      }
      return n;
    };
    const float = (col: Column, min: number, max: number) => {
      const value = raw(col);
      if (!value) return undefined;
      const n = Number(value);
      if (!Number.isFinite(n) || n < min || n > max) {
        fail(col, `"${value}" should be a number between ${min} and ${max}.`);
        return undefined;
      }
      return n;
    };
    const bool = (col: Column) => {
      const value = raw(col).toLowerCase();
      if (!value) return undefined;
      if (YES.has(value)) return true;
      if (NO.has(value)) return false;
      fail(col, `"${raw(col)}" should be yes or no.`);
      return undefined;
    };
    const oneOf = <T extends string>(col: Column, allowed: readonly T[]) => {
      const value = raw(col).toUpperCase().replace(/[\s-]+/g, "_");
      if (!value) return undefined;
      if ((allowed as readonly string[]).includes(value)) return value as T;
      fail(col, `"${raw(col)}" should be one of: ${allowed.join(", ")}.`);
      return undefined;
    };

    const nameEn = raw("nameEn");
    if (!nameEn) fail("nameEn", "Every school needs an English name.");
    const type = oneOf("type", Object.values(SchoolType));
    if (!raw("type")) fail("type", "Required: PUBLIC, PRIVATE or INTERNATIONAL.");
    const level = oneOf("level", Object.values(SchoolLevel));
    if (!raw("level")) fail("level", "Required: ELEMENTARY, MIDDLE, HIGH or K12.");

    const curriculum: Curriculum[] = [];
    for (const c of list(raw("curriculum"))) {
      const value = c.toUpperCase().replace(/[\s-]+/g, "_");
      if ((Object.values(Curriculum) as string[]).includes(value)) curriculum.push(value as Curriculum);
      else fail("curriculum", `"${c}" isn't a known curriculum (${Object.values(Curriculum).join(", ")}).`);
    }

    const languages = list(raw("teachingLanguages")).map((l) => l.toLowerCase());
    for (const l of languages) {
      if (!/^[a-z]{2}$/.test(l)) fail("teachingLanguages", `"${l}" should be a 2-letter code like mn, en, ru, ja.`);
    }

    let district = raw("district") || undefined;
    if (district) {
      const canonical =
        UB_DISTRICTS.find((d) => d.toLowerCase() === district!.toLowerCase()) ??
        DISTRICT_ALIASES[district.toLowerCase()];
      if (canonical) district = canonical;
      else warn("district", `"${district}" isn't an Ulaanbaatar district name; kept as written.`);
    }

    const latitude = float("latitude", 41, 52.5); // Mongolia's bounds
    const longitude = float("longitude", 87, 120);
    if ((latitude === undefined) !== (longitude === undefined) && !rowErrors.some((e) => e.column === "latitude" || e.column === "longitude")) {
      fail("latitude", "Give both latitude and longitude, or neither.");
    }

    const tuitionMinAnnual = int("tuitionMinAnnual", 0, 1_000_000_000);
    const tuitionMaxAnnual = int("tuitionMaxAnnual", 0, 1_000_000_000);
    if (tuitionMinAnnual !== undefined && tuitionMaxAnnual !== undefined && tuitionMinAnnual > tuitionMaxAnnual) {
      fail("tuitionMaxAnnual", "Max fee is lower than min fee.");
    }
    if (tuitionMinAnnual !== undefined && tuitionMinAnnual > 0 && tuitionMinAnnual < 100_000) {
      warn("tuitionMinAnnual", `${tuitionMinAnnual} looks too small for a yearly fee in ₮. Write the full amount (12000000) or use M (12M).`);
    }
    if (type === "PUBLIC" && (tuitionMinAnnual || tuitionMaxAnnual)) {
      warn("tuitionMinAnnual", "Public schools are shown as free; this fee won't be displayed.");
    }

    const email = raw("email") || undefined;
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fail("email", `"${email}" isn't an email address.`);

    const emailDomains = list(raw("emailDomains")).map((d) => d.toLowerCase().replace(/^@/, ""));
    for (const d of emailDomains) {
      if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(d)) fail("emailDomains", `"${d}" isn't a domain like school.edu.mn.`);
    }

    const website = raw("website") || undefined;
    if (website && /\s/.test(website)) fail("website", `"${website}" has spaces in it.`);

    if (nameEn) {
      const key = nameEn.toLowerCase();
      const earlier = seenNames.get(key);
      if (earlier) fail("nameEn", `Same name as row ${earlier}. Each school should appear once.`);
      else seenNames.set(key, rowNumber);
    }

    if (!raw("source")) {
      warn("source", "No source given. Write where the facts come from (school website, visit, phone call).");
    }

    if (rowErrors.length > 0 || !nameEn || !type || !level) {
      errors.push(...rowErrors);
      return;
    }

    const school: CsvSchool = { nameEn, type, level };
    const text = (col: Exclude<Column, "source">) => raw(col) || undefined;
    const set = <K extends keyof CsvSchool>(key: K, value: CsvSchool[K] | undefined) => {
      if (value !== undefined && !(Array.isArray(value) && value.length === 0)) school[key] = value;
    };
    set("nameMn", text("nameMn"));
    set("schoolNumber", text("schoolNumber"));
    set("curriculum", curriculum);
    set("teachingLanguages", languages);
    set("aimagCity", text("aimagCity"));
    set("district", district);
    set("khoroo", text("khoroo"));
    set("address", text("address"));
    set("latitude", latitude);
    set("longitude", longitude);
    set("locationApproximate", bool("locationApproximate"));
    set("phone", text("phone"));
    set("email", email);
    set("website", website);
    set("tuitionMinAnnual", tuitionMinAnnual);
    set("tuitionMaxAnnual", tuitionMaxAnnual);
    set("foundedYear", int("foundedYear", 1900, new Date().getFullYear()));
    set("studentTeacherRatio", text("studentTeacherRatio"));
    set("hasDormitory", bool("hasDormitory"));
    set("emailDomains", emailDomains);
    // bool()/int() calls above may have found late errors.
    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
      return;
    }
    schools.push(school);
  });

  return { schools, errors, warnings };
}
