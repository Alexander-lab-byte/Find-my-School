import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const level = searchParams.get("level");
  const type = searchParams.get("type");
  const dorm = searchParams.get("dorm");

  const where: Prisma.SchoolWhereInput = {
    AND: [
      q
        ? {
            OR: [
              { nameEn: { contains: q, mode: "insensitive" } },
              { nameMn: { contains: q, mode: "insensitive" } },
              { schoolNumber: { contains: q, mode: "insensitive" } },
              { district: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      level ? { level: level as Prisma.EnumSchoolLevelFilter["equals"] } : {},
      type ? { type: type as Prisma.EnumSchoolTypeFilter["equals"] } : {},
      dorm === "true" ? { dormitory: { isNot: null } } : {},
    ],
  };

  const schools = await prisma.school.findMany({
    where,
    take: 30,
    orderBy: { avgOverall: "desc" },
    select: {
      id: true,
      nameEn: true,
      nameMn: true,
      schoolNumber: true,
      type: true,
      level: true,
      district: true,
      aimagCity: true,
      avgOverall: true,
      reviewCount: true,
      tuitionMinAnnual: true,
      tuitionMaxAnnual: true,
      coverImageUrl: true,
    },
  });

  return NextResponse.json({ schools });
}
