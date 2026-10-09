"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { ReviewTag } from "@prisma/client";
import {
  MAX_REVIEW_LENGTH,
  MIN_REVIEW_LENGTH,
  REPORT_REASONS,
  type ReportReason,
} from "@/lib/review-limits";
import { recalculateSchoolRatings } from "@/lib/school-ratings";
import { domainMatches, emailDomain, getVerifiedEmail } from "@/lib/review-access";

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

// Errors come back as codes, not thrown messages: Next.js hides thrown
// error text in production, and the form translates codes itself.
export type SubmitReviewError =
  | "LOGIN_REQUIRED"
  | "NOT_ALLOWED"
  | "ALREADY_REVIEWED"
  | "TOO_SHORT"
  | "TOO_LONG"
  | "INVALID_RATINGS";

type SubmitReviewResult = { ok: true } | { ok: false; error: SubmitReviewError };

const isRating = (n: unknown): n is number =>
  Number.isInteger(n) && (n as number) >= 1 && (n as number) <= 5;

export async function submitReview(input: SubmitReviewInput): Promise<SubmitReviewResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "LOGIN_REQUIRED" };

  // Only verified members of this school may review it: the email they
  // proved with a one-time code must be on one of the school's domains.
  // Checked here on the server; the UI hiding the form is only a courtesy.
  const [email, school] = await Promise.all([
    getVerifiedEmail(),
    prisma.school.findUnique({ where: { id: input.schoolId }, select: { emailDomains: true } }),
  ]);
  const domain = email ? emailDomain(email) : null;
  if (!school || !domain || !domainMatches(domain, school.emailDomains)) {
    return { ok: false, error: "NOT_ALLOWED" };
  }

  // Never trust the client's validation (Temuulen's limits, enforced again here).
  const bodyText = String(input.bodyText ?? "")
    .trim()
    .replace(/\n{3,}/g, "\n\n");
  if (bodyText.length < MIN_REVIEW_LENGTH) return { ok: false, error: "TOO_SHORT" };
  if (bodyText.length > MAX_REVIEW_LENGTH) return { ok: false, error: "TOO_LONG" };

  const ratingsOk =
    [input.academics, input.facilities, input.teachers, input.environment].every(isRating) &&
    (input.dorms === undefined || isRating(input.dorms)) &&
    (input.library === undefined || isRating(input.library));
  if (!ratingsOk) return { ok: false, error: "INVALID_RATINGS" };

  const validTags = new Set<string>(Object.values(ReviewTag));
  const tags = [...new Set(input.tags ?? [])].filter((t) => validTags.has(t));

  const existing = await prisma.rating.findUnique({
    where: { schoolId_userId: { schoolId: input.schoolId, userId: user.id } },
  });
  if (existing) return { ok: false, error: "ALREADY_REVIEWED" };

  await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        schoolId: input.schoolId,
        userId: user.id,
        bodyText,
        tags,
        // Every review now comes from a verified school email.
        isVerified: true,
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
  return { ok: true };
}

export type ReportReviewError =
  | "LOGIN_REQUIRED"
  | "INVALID_REASON"
  | "NOT_FOUND"
  | "OWN_REVIEW"
  | "ALREADY_REPORTED";

type ReportReviewResult = { ok: true } | { ok: false; error: ReportReviewError };

/** Flags a review for the moderators (Temuulen's report flow). Any signed-in user may report. */
export async function reportReview(reviewId: string, reason: string): Promise<ReportReviewResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "LOGIN_REQUIRED" };
  if (!REPORT_REASONS.includes(reason as ReportReason)) return { ok: false, error: "INVALID_REASON" };

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true },
  });
  if (!review) return { ok: false, error: "NOT_FOUND" };
  if (review.userId === user.id) return { ok: false, error: "OWN_REVIEW" };

  const already = await prisma.report.findFirst({
    where: { reviewId, reporterId: user.id },
    select: { id: true },
  });
  if (already) return { ok: false, error: "ALREADY_REPORTED" };

  await prisma.report.create({ data: { reviewId, reporterId: user.id, reason } });
  return { ok: true };
}
