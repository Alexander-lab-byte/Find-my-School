"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";
import { recalculateSchoolRatings } from "@/lib/school-ratings";

/** Publishes a review (from the queue, or puts back a rejected/hidden one). */
export async function approveReview(reviewId: string) {
  await setReviewStatus(reviewId, "PUBLISHED");
}

/** Rejects a pending review, or takes down a published one. */
export async function rejectReview(reviewId: string) {
  await setReviewStatus(reviewId, "REJECTED");
}

async function setReviewStatus(reviewId: string, status: "PUBLISHED" | "REJECTED") {
  // Admins only; anyone else gets nothing (no hint the action exists).
  if (!(await getAdminUser())) return;

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { schoolId: true },
  });
  if (!review) return;

  await prisma.$transaction(async (tx) => {
    await tx.review.update({ where: { id: reviewId }, data: { status, moderatedAt: new Date() } });
    // The school's averages and review count only include published reviews.
    await recalculateSchoolRatings(tx, review.schoolId);
  });

  revalidatePath("/admin", "layout");
  revalidatePath(`/school/${review.schoolId}`, "layout");
  revalidatePath("/");
}
