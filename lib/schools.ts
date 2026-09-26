import { prisma } from "@/lib/prisma";

export function getSchoolHeader(id: string) {
  return prisma.school.findUnique({
    where: { id },
    select: {
      id: true,
      nameEn: true,
      nameMn: true,
      schoolNumber: true,
      logoUrl: true,
      coverImageUrl: true,
      type: true,
      level: true,
      aimagCity: true,
      district: true,
      khoroo: true,
      address: true,
      phone: true,
      website: true,
      email: true,
      avgOverall: true,
      reviewCount: true,
    },
  });
}

export function getSchoolOverview(id: string) {
  return prisma.school.findUnique({
    where: { id },
    select: {
      curriculum: true,
      teachingLanguages: true,
      studentTeacherRatio: true,
      accreditation: true,
      avgAcademics: true,
      avgTeachers: true,
      avgEnvironment: true,
    },
  });
}

export function getSchoolFacilities(id: string) {
  return prisma.school.findUnique({
    where: { id },
    select: {
      avgFacilities: true,
      avgLibrary: true,
      facilities: {
        select: { id: true, nameEn: true, nameMn: true, category: true, description: true, imageUrl: true },
      },
    },
  });
}

export function getSchoolDormitory(id: string) {
  return prisma.school.findUnique({
    where: { id },
    select: {
      avgDorms: true,
      dormitory: true,
    },
  });
}

export function getSchoolAdmissions(id: string) {
  return prisma.school.findUnique({
    where: { id },
    select: {
      type: true,
      tuitionMinAnnual: true,
      tuitionMaxAnnual: true,
      applicationDeadline: true,
      entranceExamInfo: true,
      catchmentAreaInfo: true,
    },
  });
}

export function getSchoolReviews(id: string) {
  return prisma.review.findMany({
    where: { schoolId: id, status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: {
      rating: true,
      user: { select: { name: true, role: true, isVerified: true } },
    },
  });
}

export function getSchoolHasDorm(id: string) {
  return prisma.dormitory.findUnique({ where: { schoolId: id }, select: { id: true } });
}
