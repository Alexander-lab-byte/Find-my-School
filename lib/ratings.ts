type SchoolAverages = {
  avgAcademics: number | null;
  avgTeachers: number | null;
  avgFacilities: number | null;
  avgEnvironment: number | null;
  avgLibrary: number | null;
  avgDorms: number | null;
};

export type RatingCategory =
  | "academics"
  | "teachers"
  | "facilities"
  | "environment"
  | "library"
  | "dorms";

/**
 * The per-category breakdown shown on a school's overview and reviews tabs.
 * `key` doubles as the message key in the "Ratings" namespace.
 */
export function ratingCategories(school: SchoolAverages, hasDorm: boolean) {
  const categories: { key: RatingCategory; value: number | null }[] = [
    { key: "academics", value: school.avgAcademics },
    { key: "teachers", value: school.avgTeachers },
    { key: "facilities", value: school.avgFacilities },
    { key: "environment", value: school.avgEnvironment },
    { key: "library", value: school.avgLibrary },
  ];
  if (hasDorm) categories.push({ key: "dorms", value: school.avgDorms });
  return categories;
}

type CoreRating = {
  academics: number;
  facilities: number;
  teachers: number;
  environment: number;
};

/** One reviewer's overall score — the same four categories the school average uses. */
export function reviewAverage(rating: CoreRating | null) {
  if (!rating) return null;
  return (rating.academics + rating.facilities + rating.teachers + rating.environment) / 4;
}
