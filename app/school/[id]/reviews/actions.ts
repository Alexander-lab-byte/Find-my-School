"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { ReviewTag } from "@prisma/client";
import { MAX_REVIEW_LENGTH, MIN_REVIEW_LENGTH } from "@/lib/review-limits";
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
  return { ok: true };
}
