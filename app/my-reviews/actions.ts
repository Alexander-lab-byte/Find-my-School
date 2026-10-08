"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { recalculateSchoolRatings } from "@/lib/school-ratings";

export async function deleteMyReview(reviewId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Please log in.");
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true, schoolId: true },
  });
  if (!review || review.userId !== user.id) {
    throw new Error("Review not found.");
  }

  await prisma.$transaction(async (tx) => {
    // The rating row must go too — otherwise it keeps counting toward the
    // school's average and blocks the user from reviewing this school again.
    await tx.rating.deleteMany({ where: { reviewId } });
    await tx.review.delete({ where: { id: reviewId } });
    await recalculateSchoolRatings(tx, review.schoolId);
  });

  revalidatePath("/my-reviews");
  revalidatePath(`/school/${review.schoolId}`, "layout");
}
