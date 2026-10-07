type SchoolAverages = {
  avgAcademics: number | null;
  avgTeachers: number | null;
  avgFacilities: number | null;
  avgEnvironment: number | null;
  avgLibrary: number | null;
  avgDorms: number | null;
};

/** The per-category breakdown shown on a school's overview and reviews tabs. */
export function ratingCategories(school: SchoolAverages, hasDorm: boolean) {
  return [
    { label: "Academics", value: school.avgAcademics },
    { label: "Teachers", value: school.avgTeachers },
    { label: "Facilities", value: school.avgFacilities },
    { label: "Campus environment", value: school.avgEnvironment },
    { label: "Library", value: school.avgLibrary },
    ...(hasDorm ? [{ label: "Dormitory", value: school.avgDorms }] : []),
  ];
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
