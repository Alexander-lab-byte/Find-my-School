"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { recalculateSchoolRatings } from "@/lib/school-ratings";

/** Deletes one of the signed-in user's own reviews (Temuulen's feature). */
export async function deleteMyReview(reviewId: string) {
  const user = await getCurrentUser();
  if (!user) return;

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true, schoolId: true },
  });
  // Someone else's review, or already gone: nothing to do.
  if (!review || review.userId !== user.id) return;

  await prisma.$transaction(async (tx) => {
    // Reports and the rating go too — otherwise the rating keeps counting
    // toward the school's average and blocks reviewing this school again.
    await tx.report.deleteMany({ where: { reviewId } });
    await tx.rating.deleteMany({ where: { reviewId } });
    await tx.review.delete({ where: { id: reviewId } });
    await recalculateSchoolRatings(tx, review.schoolId);
  });

  revalidatePath("/my-reviews");
  revalidatePath(`/school/${review.schoolId}`, "layout");
}
