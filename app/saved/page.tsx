import Link from "next/link";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/current-user";
import { getSavedSchoolsForUser } from "@/lib/schools";
import { StarRating } from "@/components/common/StarRating";
import { TYPE_LABELS, LEVEL_LABELS } from "@/lib/labels";

export default async function SavedSchoolsPage() {
  const isSignedIn = (await headers()).get("x-user-signed-in") === "1";
  const user = isSignedIn ? await getCurrentUser() : null;

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Saved schools
        </h1>
        <p className="mt-2 text-zinc-500">Log in to see schools you&apos;ve saved.</p>
        <Link href="/login" className="mt-4 inline-block text-accent underline underline-offset-4">
          Log in
        </Link>
      </div>
    );
  }

  const saved = await getSavedSchoolsForUser(user.id);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
        Saved schools
      </h1>

      {saved.length === 0 ? (
        <p className="mt-4 text-zinc-500">
          You haven&apos;t saved any schools yet. Tap Save on a school&apos;s page to add one here.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map(({ school }) => (
            <Link
              key={school.id}
              href={`/school/${school.id}`}
              className="rounded-[var(--radius-card)] border border-zinc-200 p-4 transition-colors hover:border-accent/40 dark:border-zinc-800"
            >
              <div className="text-sm text-zinc-500">{school.district ?? school.aimagCity}</div>
              <div className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">{school.nameEn}</div>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                <span>{TYPE_LABELS[school.type]}</span>
                <span>{LEVEL_LABELS[school.level]}</span>
              </div>
              <div className="mt-3">
                <StarRating value={school.avgOverall} count={school.reviewCount} size="sm" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
