import { PrismaClient, SchoolType, SchoolLevel, Curriculum } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const schools = [
    {
      schoolNumber: "School #1",
      nameEn: "First School of Ulaanbaatar",
      nameMn: "Улаанбаатар хотын 1-р сургууль",
      type: SchoolType.PUBLIC,
      level: SchoolLevel.K12,
      curriculum: [Curriculum.MONGOLIAN_NATIONAL],
      teachingLanguages: ["mn"],
      aimagCity: "Ulaanbaatar",
      district: "Sukhbaatar",
      khoroo: "1",
      latitude: 47.9184,
      longitude: 106.9177,
    },
    {
      schoolNumber: null,
      nameEn: "International School of Ulaanbaatar",
      nameMn: "Улаанбаатар олон улсын сургууль",
      type: SchoolType.INTERNATIONAL,
      level: SchoolLevel.K12,
      curriculum: [Curriculum.IB, Curriculum.AP],
      teachingLanguages: ["en", "mn"],
      aimagCity: "Ulaanbaatar",
      district: "Khan-Uul",
      khoroo: "3",
      latitude: 47.8864,
      longitude: 106.9057,
      tuitionMinAnnual: 12000000,
      tuitionMaxAnnual: 18000000,
    },
  ];

  for (const school of schools) {
    await prisma.school.create({ data: school });
  }

  console.log(`Seeded ${schools.length} schools.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
