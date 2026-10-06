import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSchoolHeader } from "@/lib/schools";
import { SchoolHeader } from "@/components/school-profile/SchoolHeader";
import { SchoolTabs } from "@/components/school-profile/SchoolTabs";

type SchoolLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: SchoolLayoutProps): Promise<Metadata> {
  const { id } = await params;
  const school = await getSchoolHeader(id);
  if (!school) return { title: "School not found" };

  return {
    title: school.nameEn,
    description: `Ratings, reviews, fees, and admissions for ${school.nameEn} (${school.nameMn}), ${
      school.district ?? school.aimagCity
    }.`,
  };
}

export default async function SchoolLayout({ children, params }: SchoolLayoutProps) {
  const { id } = await params;
  const school = await getSchoolHeader(id);

  if (!school) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <SchoolHeader school={school} />
      <div className="sticky top-0 z-10 border-b border-line bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <SchoolTabs schoolId={school.id} reviewCount={school.reviewCount} />
        </div>
      </div>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
