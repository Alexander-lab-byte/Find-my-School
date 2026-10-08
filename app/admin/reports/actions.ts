"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { recalculateSchoolRatings } from "@/lib/school-ratings";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Not allowed.");
  }
  return user;
}

/** Hides the reported review (and its rating) and closes every open report on it. */
export async function hideReportedReview(reportId: string) {
  await requireAdmin();

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { reviewId: true, review: { select: { schoolId: true } } },
  });
  if (!report) return;

  await prisma.$transaction(async (tx) => {
    await tx.review.update({ where: { id: report.reviewId }, data: { status: "HIDDEN" } });
    await tx.report.updateMany({
      where: { reviewId: report.reviewId, status: "PENDING" },
      data: { status: "RESOLVED" },
    });
    await recalculateSchoolRatings(tx, report.review.schoolId);
  });

  revalidatePath("/admin/reports");
  revalidatePath(`/school/${report.review.schoolId}`, "layout");
}

/** Closes the report and leaves the review up. */
export async function dismissReport(reportId: string) {
  await requireAdmin();
  await prisma.report.update({ where: { id: reportId }, data: { status: "DISMISSED" } });
  revalidatePath("/admin/reports");
}
