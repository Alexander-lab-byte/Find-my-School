import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { getVerifiedEmail } from "@/lib/review-access";

/**
 * Admins approve reviews and handle reports. Someone is an admin when their
 * email is listed in ADMIN_EMAILS (comma-separated) or their User row has
 * role ADMIN — and, either way, only while signed in with an emailed code,
 * so nobody gets admin by password-registering an admin's address.
 */
function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const getAdminUser = cache(async () => {
  const [user, email] = await Promise.all([getCurrentUser(), getVerifiedEmail()]);
  if (!user || !email) return null;
  return user.role === "ADMIN" || adminEmails().includes(email) ? user : null;
});

/** For admin pages: anyone else gets a plain 404 (no hint the page exists). */
export async function requireAdmin() {
  const admin = await getAdminUser();
  if (!admin) notFound();
  return admin;
}

/** What's waiting for an admin: reviews to approve and open reports. */
export const getModerationCounts = cache(async () => {
  const [pendingReviews, openReports] = await Promise.all([
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { status: "PENDING" } }),
  ]);
  return { pendingReviews, openReports, total: pendingReviews + openReports };
});

export type ModerationTab = "pending" | "published" | "rejected";
export const MODERATION_PAGE_SIZE = 50;

const TAB_STATUSES: Record<ModerationTab, string[]> = {
  pending: ["PENDING"],
  published: ["PUBLISHED"],
  rejected: ["REJECTED", "HIDDEN"],
};

/** Reviews for one admin tab, with what an admin needs to judge them. */
export function getModerationReviews(tab: ModerationTab) {
  return prisma.review.findMany({
    where: { status: { in: TAB_STATUSES[tab] } },
    // The queue is first come, first served; the history shows the latest decisions first.
    orderBy:
      tab === "pending"
        ? [{ createdAt: "asc" }]
        : [{ moderatedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
    take: MODERATION_PAGE_SIZE,
    select: {
      id: true,
      bodyText: true,
      tags: true,
      status: true,
      createdAt: true,
      moderatedAt: true,
      rating: {
        select: {
          academics: true,
          facilities: true,
          teachers: true,
          environment: true,
          library: true,
          dorms: true,
        },
      },
      user: { select: { name: true, email: true, role: true } },
      school: { select: { id: true, nameEn: true, nameMn: true, emailDomains: true } },
    },
  });
}

export type ModerationReview = Awaited<ReturnType<typeof getModerationReviews>>[number];
