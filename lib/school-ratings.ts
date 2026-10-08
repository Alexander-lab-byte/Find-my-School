import type { Prisma } from "@prisma/client";

/**
 * Recomputes a school's cached averages and review count from its ratings.
 * Ratings attached to a hidden/removed review don't count. Call this inside
 * the same transaction that created, hid, or deleted a review.
 */
export async function recalculateSchoolRatings(tx: Prisma.TransactionClient, schoolId: string) {
  const agg = await tx.rating.aggregate({
    where: {
      schoolId,
      OR: [{ reviewId: null }, { review: { status: "PUBLISHED" } }],
    },
    _avg: {
      academics: true,
      facilities: true,
      teachers: true,
      environment: true,
      dorms: true,
      library: true,
    },
    _count: true,
  });

  const overallInputs = [
    agg._avg.academics,
    agg._avg.facilities,
    agg._avg.teachers,
    agg._avg.environment,
  ].filter((n): n is number => n != null);
  const avgOverall =
    overallInputs.length > 0
      ? overallInputs.reduce((sum, n) => sum + n, 0) / overallInputs.length
      : 0;

  await tx.school.update({
    where: { id: schoolId },
    data: {
      avgAcademics: agg._avg.academics ?? 0,
      avgFacilities: agg._avg.facilities ?? 0,
      avgTeachers: agg._avg.teachers ?? 0,
      avgEnvironment: agg._avg.environment ?? 0,
      avgDorms: agg._avg.dorms ?? 0,
      avgLibrary: agg._avg.library ?? 0,
      avgOverall,
      reviewCount: agg._count,
    },
  });
}
