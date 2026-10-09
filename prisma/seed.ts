import { PrismaClient, Prisma, SchoolType, SchoolLevel, Curriculum } from "@prisma/client";

const prisma = new PrismaClient();

const facility = (nameEn: string, nameMn: string, category: string, description?: string) => ({
  nameEn,
  nameMn,
  category,
  description,
});

// Records marked "(Demo)" are made-up placeholders for development — replace
// them with real school data before launch.
const schools: Prisma.SchoolCreateInput[] = [
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
  {
    schoolNumber: "School #101",
    nameEn: "Sample Elementary School (Demo)",
    nameMn: "Жишээ бага сургууль (демо)",
    type: SchoolType.PUBLIC,
    level: SchoolLevel.ELEMENTARY,
    curriculum: [Curriculum.MONGOLIAN_NATIONAL],
    teachingLanguages: ["mn"],
    aimagCity: "Ulaanbaatar",
    district: "Bayanzurkh",
    khoroo: "12",
    latitude: 47.9231,
    longitude: 106.9712,
    studentTeacherRatio: "28:1",
    catchmentAreaInfo: "Demo text: children living in khoroo 12 are admitted first.",
    facilities: {
      create: [
        facility("Library", "Номын сан", "Learning", "Demo library with a reading corner."),
        facility("Sports hall", "Спорт заал", "Sports"),
      ],
    },
  },
  {
    schoolNumber: "School #102",
    nameEn: "Sample Middle School (Demo)",
    nameMn: "Жишээ дунд сургууль (демо)",
    type: SchoolType.PUBLIC,
    level: SchoolLevel.MIDDLE,
    curriculum: [Curriculum.MONGOLIAN_NATIONAL],
    teachingLanguages: ["mn", "en"],
    aimagCity: "Ulaanbaatar",
    district: "Chingeltei",
    khoroo: "5",
    latitude: 47.9335,
    longitude: 106.9101,
    studentTeacherRatio: "30:1",
    facilities: {
      create: [facility("Computer lab", "Компьютерийн кабинет", "Learning")],
    },
  },
  {
    schoolNumber: "School #103",
    nameEn: "Sample High School (Demo)",
    nameMn: "Жишээ ахлах сургууль (демо)",
    type: SchoolType.PUBLIC,
    level: SchoolLevel.HIGH,
    curriculum: [Curriculum.MONGOLIAN_NATIONAL],
    teachingLanguages: ["mn"],
    aimagCity: "Ulaanbaatar",
    district: "Songinokhairkhan",
    khoroo: "8",
    latitude: 47.9139,
    longitude: 106.8412,
    entranceExamInfo: "Demo text: entrance exam in mathematics and Mongolian language.",
    facilities: {
      create: [
        facility("Science laboratory", "Лаборатори", "Learning"),
        facility("Canteen", "Хоолны газар", "Food"),
      ],
    },
    dormitory: {
      create: {
        roomCapacity: 4,
        monthlyFeeAmount: 120000,
        livingConditions: "Demo text: four students per room, shared bathrooms on each floor.",
        boardingRules: "Demo text: lights out at 22:00 on school nights.",
        safetyInfo: "Demo text: staffed entrance and a resident teacher on every floor.",
      },
    },
  },
  {
    schoolNumber: null,
    nameEn: "Sample Private K-12 School (Demo)",
    nameMn: "Жишээ хувийн сургууль (демо)",
    type: SchoolType.PRIVATE,
    level: SchoolLevel.K12,
    curriculum: [Curriculum.MONGOLIAN_NATIONAL, Curriculum.DUAL_LANGUAGE],
    teachingLanguages: ["mn", "en"],
    aimagCity: "Ulaanbaatar",
    district: "Khan-Uul",
    khoroo: "15",
    latitude: 47.8802,
    longitude: 106.8975,
    studentTeacherRatio: "15:1",
    tuitionMinAnnual: 6000000,
    tuitionMaxAnnual: 9000000,
    applicationDeadline: new Date("2027-05-31"),
    entranceExamInfo: "Demo text: interview and placement test in English and mathematics.",
    facilities: {
      create: [
        facility("Library", "Номын сан", "Learning"),
        facility("Swimming pool", "Усан бассейн", "Sports"),
        facility("Canteen", "Хоолны газар", "Food"),
      ],
    },
    dormitory: {
      create: {
        roomCapacity: 2,
        monthlyFeeAmount: 450000,
        livingConditions: "Demo text: twin rooms with study desks.",
      },
    },
  },
  {
    schoolNumber: null,
    nameEn: "Sample Cambridge School (Demo)",
    nameMn: "Жишээ Кембрижийн сургууль (демо)",
    type: SchoolType.PRIVATE,
    level: SchoolLevel.HIGH,
    curriculum: [Curriculum.CAMBRIDGE],
    teachingLanguages: ["en"],
    aimagCity: "Ulaanbaatar",
    district: "Sukhbaatar",
    khoroo: "6",
    latitude: 47.9206,
    longitude: 106.9285,
    tuitionMinAnnual: 9000000,
    tuitionMaxAnnual: 9000000,
    accreditation: "Demo accreditation",
  },
  {
    schoolNumber: "School #5",
    nameEn: "Sample Regional School (Demo)",
    nameMn: "Жишээ аймгийн сургууль (демо)",
    type: SchoolType.PUBLIC,
    level: SchoolLevel.K12,
    curriculum: [Curriculum.MONGOLIAN_NATIONAL],
    teachingLanguages: ["mn", "ru"],
    aimagCity: "Darkhan-Uul",
    district: "Darkhan",
    latitude: 49.4867,
    longitude: 105.9228,
    dormitory: {
      create: {
        roomCapacity: 6,
        monthlyFeeAmount: 60000,
        livingConditions: "Demo text: for students from outlying soums.",
      },
    },
  },
];

async function main() {
  let created = 0;

  for (const school of schools) {
    // Safe to run more than once: schools are matched by English name.
    const existing = await prisma.school.findFirst({
      where: { nameEn: school.nameEn },
      select: { id: true },
    });
    if (existing) continue;

    await prisma.school.create({ data: school });
    created++;
  }

  console.log(`Seeded ${created} new schools (${schools.length - created} already existed).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
