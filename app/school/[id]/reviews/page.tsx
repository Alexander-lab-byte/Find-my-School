import { notFound } from "next/navigation";
import { getSchoolHeader, getSchoolReviews, getSchoolHasDorm } from "@/lib/schools";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewCard } from "@/components/reviews/ReviewCard";

export default async function SchoolReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const school = await getSchoolHeader(id);

  if (!school) notFound();

  const [reviews, dorm] = await Promise.all([getSchoolReviews(id), getSchoolHasDorm(id)]);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Write a review</h2>
        <div className="mt-3">
          <ReviewForm schoolId={id} hasDorm={!!dorm} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
        </h2>
        <div className="mt-3 space-y-4">
          {reviews.length === 0 && (
            <p className="text-zinc-500">Be the first to review this school.</p>
          )}
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </section>
    </div>
  );
}
