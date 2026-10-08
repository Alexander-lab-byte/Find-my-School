"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { ReviewTag } from "@prisma/client";
import { MAX_REVIEW_LENGTH, MIN_REVIEW_LENGTH, REPORT_REASONS } from "@/lib/review-limits";
import { recalculateSchoolRatings } from "@/lib/school-ratings";

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

  const school = await prisma.school.findUnique({
    where: { id: input.schoolId },
    select: { id: true },
  });
  if (!school) {
    throw new Error("School not found.");
  }

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
        bodyText,
        tags,
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

    await recalculateSchoolRatings(tx, input.schoolId);
  });

  revalidatePath(`/school/${input.schoolId}/reviews`);
  revalidatePath(`/school/${input.schoolId}`);
}

export async function reportReview(reviewId: string, reason: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Please log in to report a review.");
  }
  if (!(REPORT_REASONS as readonly string[]).includes(reason)) {
    throw new Error("Please choose a reason.");
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true },
  });
  if (!review) {
    throw new Error("Review not found.");
  }
  if (review.userId === user.id) {
    throw new Error("You can't report your own review.");
  }

  const already = await prisma.report.findFirst({
    where: { reviewId, reporterId: user.id },
    select: { id: true },
  });
  if (already) {
    throw new Error("You've already reported this review.");
  }

  await prisma.report.create({ data: { reviewId, reporterId: user.id, reason } });
}
