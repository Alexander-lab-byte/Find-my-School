"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { ReviewTag } from "@prisma/client";
import { MAX_REVIEW_LENGTH, MIN_REVIEW_LENGTH } from "@/lib/review-limits";

type SubmitReviewInput = {
  schoolId: string;
  bodyText: string;
  tags: ReviewTag[];
  academics: number;
  facilities: number;
  teachers: number;
  environment: number;
  dorms?: number;
  library?: number;
};

export async function submitReview(input: SubmitReviewInput) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Please log in to leave a review.");
  }
  const bodyText = String(input.bodyText ?? "")
    .trim()
    .replace(/\n{3,}/g, "\n\n");
  if (bodyText.length < MIN_REVIEW_LENGTH) {
    throw new Error("Please write at least a couple of sentences.");
  }
  if (bodyText.length > MAX_REVIEW_LENGTH) {
    throw new Error(`Reviews can be at most ${MAX_REVIEW_LENGTH} characters.`);
  }

  const isRating = (n: unknown): n is number => Number.isInteger(n) && (n as number) >= 1 && (n as number) <= 5;
  const ratingsOk =
    [input.academics, input.facilities, input.teachers, input.environment].every(isRating) &&
    (input.dorms === undefined || isRating(input.dorms)) &&
    (input.library === undefined || isRating(input.library));
  if (!ratingsOk) {
    throw new Error("Ratings must be whole numbers from 1 to 5.");
  }

  const validTags = new Set<string>(Object.values(ReviewTag));
  const tags = [...new Set(input.tags ?? [])].filter((t) => validTags.has(t));

  const existing = await prisma.rating.findUnique({
    where: { schoolId_userId: { schoolId: input.schoolId, userId: user.id } },
  });
  if (existing) {
    throw new Error("You've already reviewed this school.");
  }

  await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        schoolId: input.schoolId,
        userId: user.id,
        bodyText: input.bodyText,
        tags: input.tags,
        isVerified: user.isVerified,
      },
    });

    await tx.rating.create({
      data: {
        schoolId: input.schoolId,
        userId: user.id,
        reviewId: review.id,
        academics: input.academics,
        facilities: input.facilities,
        teachers: input.teachers,
        environment: input.environment,
        dorms: input.dorms,
        library: input.library,
      },
    });

    const agg = await tx.rating.aggregate({
      where: { schoolId: input.schoolId },
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
      where: { id: input.schoolId },
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
  });

  revalidatePath(`/school/${input.schoolId}/reviews`);
  revalidatePath(`/school/${input.schoolId}`);
}
