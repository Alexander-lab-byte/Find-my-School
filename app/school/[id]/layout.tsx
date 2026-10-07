import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getSchoolHeader, getIsSchoolSaved } from "@/lib/schools";
import { getCurrentUser } from "@/lib/current-user";
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
    description: `Ratings, reviews, fees, and admissions for ${school.nameEn}${school.nameMn ? ` (${school.nameMn})` : ""}, ${
      school.district ?? school.aimagCity
    }.`,
  };
}

export default async function SchoolLayout({ children, params }: SchoolLayoutProps) {
  const { id } = await params;
  const school = await getSchoolHeader(id);

  if (!school) notFound();

  // Set by lib/supabase/middleware.ts. Only pay the real getUser() network
  // cost when someone is actually signed in — logged-out visitors (most
  // traffic) skip it entirely and we already know isSaved is false.
  const isSignedIn = (await headers()).get("x-user-signed-in") === "1";
  const user = isSignedIn ? await getCurrentUser() : null;
  const isSaved = await getIsSchoolSaved(id, user?.id ?? null);

  return (
    <div className="flex flex-1 flex-col">
      <SchoolHeader school={school} isSaved={isSaved} />
      <div className="sticky top-0 z-10 border-b border-line bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <SchoolTabs schoolId={school.id} reviewCount={school.reviewCount} />
        </div>
      </div>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
