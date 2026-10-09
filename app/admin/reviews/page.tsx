import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  MODERATION_PAGE_SIZE,
  getModerationCounts,
  getModerationReviews,
  requireAdmin,
  type ModerationTab,
} from "@/lib/admin";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ModerationReviewCard } from "@/components/admin/ModerationReviewCard";
import { EmptyNote } from "@/components/school-profile/ProfileSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Admin");
  return { title: t("title"), robots: { index: false } };
}

const TABS: ModerationTab[] = ["pending", "published", "rejected"];
const EMPTY_KEYS = {
  pending: "emptyPending",
  published: "emptyPublished",
  rejected: "emptyRejected",
} as const;

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();

  const { status } = await searchParams;
  const tab = TABS.find((t) => t === status) ?? "pending";
  const [reviews, counts, t] = await Promise.all([
    getModerationReviews(tab),
    getModerationCounts(),
    getTranslations("Admin"),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <AdminHeader active={tab} counts={counts} />

      <div className="mt-6 space-y-4">
        {reviews.length === 0 && <EmptyNote>{t(EMPTY_KEYS[tab])}</EmptyNote>}
        {reviews.map((review) => (
          <ModerationReviewCard key={review.id} review={review} />
        ))}
        {reviews.length === MODERATION_PAGE_SIZE && (
          <p className="text-center text-xs text-subtle">{t("showingLatest", { count: MODERATION_PAGE_SIZE })}</p>
        )}
      </div>
    </main>
  );
}
