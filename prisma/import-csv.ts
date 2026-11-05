import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { readSchoolsCsv, type RowProblem } from "./csv-schools";

/**
 * Import schools from a CSV file (exported from Google Sheets or Excel).
 *
 *   npm run db:import-csv -- prisma/data/my-schools.csv          # check only
 *   npm run db:import-csv -- prisma/data/my-schools.csv --write  # save
 *
 * Without --write nothing touches the database: you get a list of problems
 * with row numbers, so the sheet can be fixed first. With --write, nothing
 * is saved unless every row is valid.
 *
 * A row updates the school with the same English name, or creates it.
 * Empty cells never erase existing data. Reviews, ratings and saves are
 * never touched. Template: prisma/data/schools-template.csv
 */

function print(label: string, problems: RowProblem[]) {
  if (problems.length === 0) return;
  console.log(`\n${label} (${problems.length}):`);
  for (const p of problems) {
    console.log(`  row ${p.row}${p.column ? ` [${p.column}]` : ""}: ${p.message}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  const write = args.includes("--write");
  if (!file) {
    console.error("Usage: npm run db:import-csv -- <file.csv> [--write]");
    process.exit(1);
  }

  const { schools, errors, warnings } = readSchoolsCsv(readFileSync(file, "utf8"));
  print("Warnings", warnings);
  print("Errors", errors);
  console.log(`\n${schools.length} valid ${schools.length === 1 ? "row" : "rows"}, ${errors.length} ${errors.length === 1 ? "error" : "errors"}.`);

  if (errors.length > 0) {
    console.log("Fix the errors and run again. Nothing was saved.");
    process.exit(1);
  }
  if (!write) {
    console.log("Check only. Run again with --write to save.");
    return;
  }

  const prisma = new PrismaClient();
  let created = 0;
  let updated = 0;
  try {
    // One transaction: either the whole sheet is saved, or none of it.
    await prisma.$transaction(
      async (tx) => {
        for (const { hasDormitory, aimagCity, ...school } of schools) {
          const existing = await tx.school.findFirst({
            where: { nameEn: { equals: school.nameEn, mode: "insensitive" } },
            select: { id: true },
          });
          const saved = existing
            ? await tx.school.update({
                where: { id: existing.id },
                data: { ...school, ...(aimagCity ? { aimagCity } : {}) },
                select: { id: true },
              })
            : await tx.school.create({
                data: { ...school, aimagCity: aimagCity ?? "Ulaanbaatar" },
                select: { id: true },
              });
          if (existing) updated++;
          else created++;

          // "yes" adds an (empty) dormitory record so the school shows up in
          // dormitory filters; details can be filled in later. "no" removes it.
          if (hasDormitory === true) {
            await tx.dormitory.upsert({
              where: { schoolId: saved.id },
              create: { schoolId: saved.id, imageUrls: [] },
              update: {},
            });
          } else if (hasDormitory === false) {
            await tx.dormitory.deleteMany({ where: { schoolId: saved.id } });
          }
        }
      },
      { timeout: 120_000 }
    );
  } finally {
    await prisma.$disconnect();
  }
  console.log(`Saved: ${created} created, ${updated} updated.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
