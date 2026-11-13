import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/current-user";
import { getSavedSchoolsForUser } from "@/lib/schools";
import { EmptyState } from "@/components/common/EmptyState";
import { SchoolCard } from "@/components/search/SchoolCard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return { title: t("saved") };
}

export default async function SavedSchoolsPage() {
  const isSignedIn = (await headers()).get("x-user-signed-in") === "1";
  const user = isSignedIn ? await getCurrentUser() : null;
  const saved = user ? await getSavedSchoolsForUser(user.id) : [];
  const t = await getTranslations("Saved");
  const tCommon = await getTranslations("Common");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="page-title">
        {t("title")}
      </h1>

      <div className="mt-8">
        {!user ? (
          <EmptyState icon="lock" title={t("loginTitle")} body={t("loginBody")}>
            <Link href="/login?next=%2Fsaved" className="btn-primary">
              {tCommon("logIn")}
            </Link>
          </EmptyState>
        ) : saved.length === 0 ? (
          <EmptyState icon="bookmark" title={t("emptyTitle")} body={t("emptyBody")}>
            <Link href="/search" className="btn-primary">
              {tCommon("browseSchools")}
            </Link>
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {saved.map(({ school }) => (
              <li key={school.id}>
                <SchoolCard school={school} heading="h2" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
