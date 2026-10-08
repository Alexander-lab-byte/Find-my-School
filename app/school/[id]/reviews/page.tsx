import { notFound } from "next/navigation";
import { getSchoolRatings, getSchoolReviews } from "@/lib/schools";
import { ratingCategories } from "@/lib/ratings";
import { RatingSummary } from "@/components/reviews/RatingSummary";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { EmptyNote, ProfileSection } from "@/components/school-profile/ProfileSection";

export default async function SchoolReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [school, reviews] = await Promise.all([getSchoolRatings(id), getSchoolReviews(id)]);

  if (!school) notFound();

  const hasDorm = Boolean(school.dormitory);

  return (
    <div className="space-y-10">
      <RatingSummary
        overall={school.avgOverall}
        count={school.reviewCount}
        categories={ratingCategories(school, hasDorm)}
      />

      <ProfileSection title="Write a review">
        <ReviewForm schoolId={id} hasDorm={hasDorm} />
      </ProfileSection>

      <ProfileSection title={`${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`}>
        <div className="space-y-4">
          {reviews.length === 0 && <EmptyNote>Be the first to review this school.</EmptyNote>}
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </ProfileSection>
    </div>
  );
}
