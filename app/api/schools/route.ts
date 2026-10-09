import { NextRequest, NextResponse } from "next/server";
import { listSchools, parseSchoolFilters, parseSort } from "@/lib/schools";

const MAX_LIMIT = 30;

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number.parseInt(params.limit ?? "", 10) || MAX_LIMIT));

  const schools = await listSchools({
    filters: parseSchoolFilters(params),
    sort: parseSort(params.sort),
    take: limit,
  });

  return NextResponse.json({ schools });
}
