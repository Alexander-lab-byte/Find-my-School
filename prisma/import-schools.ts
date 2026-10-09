import { PrismaClient } from "@prisma/client";
import { SCHOOLS } from "./data/schools";

const prisma = new PrismaClient();

// Idempotent: updates a school when one with the same English name exists,
// otherwise creates it. Ratings, reviews, and saves are never touched.
async function main() {
  let created = 0;
  let updated = 0;

  for (const { aimagCity = "Ulaanbaatar", ...school } of SCHOOLS) {
    const existing = await prisma.school.findFirst({
      where: { nameEn: { equals: school.nameEn, mode: "insensitive" } },
      select: { id: true },
    });

    if (existing) {
      await prisma.school.update({ where: { id: existing.id }, data: { ...school, aimagCity } });
      updated++;
    } else {
      await prisma.school.create({ data: { ...school, aimagCity } });
      created++;
    }
  }

  console.log(`Schools imported: ${created} created, ${updated} updated.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
