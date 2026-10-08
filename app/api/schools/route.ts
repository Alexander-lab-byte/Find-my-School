import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildSchoolOrderBy, buildSchoolWhere, parseSchoolSearch } from "@/lib/school-search";

export async function GET(req: NextRequest) {
  const search = parseSchoolSearch(Object.fromEntries(req.nextUrl.searchParams));

  const schools = await prisma.school.findMany({
    where: buildSchoolWhere(search),
    take: 30,
    orderBy: buildSchoolOrderBy(search.sort),
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
