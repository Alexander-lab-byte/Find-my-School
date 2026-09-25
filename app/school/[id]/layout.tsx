import { notFound } from "next/navigation";
import { getSchoolHeader } from "@/lib/schools";
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

  return (
    <div className="flex flex-1 flex-col">
      <SchoolHeader school={school} />
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur dark:bg-black/90">
        <div className="mx-auto max-w-4xl px-6">
          <SchoolTabs schoolId={school.id} />
        </div>
      </div>
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
