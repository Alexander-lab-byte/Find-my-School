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
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur dark:bg-black/90">
        <div className="mx-auto max-w-4xl px-6">
          <SchoolTabs schoolId={school.id} />
        </div>
      </div>
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
