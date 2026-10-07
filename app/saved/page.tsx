import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/current-user";
import { getSavedSchoolsForUser } from "@/lib/schools";
import { Icon } from "@/components/common/Icon";
import { SchoolCard } from "@/components/search/SchoolCard";

export const metadata: Metadata = {
  title: "Saved schools",
};

function EmptyState({ title, body, href, cta }: { title: string; body: string; href: string; cta: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-muted text-subtle">
        <Icon name="search" className="size-5" />
      </span>
      <h2 className="mt-4 font-display text-xl font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{body}</p>
      <Link
        href={href}
        className="mt-6 inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
      >
        {cta}
      </Link>
    </div>
  );
}

export default async function SavedSchoolsPage() {
  const isSignedIn = (await headers()).get("x-user-signed-in") === "1";
  const user = isSignedIn ? await getCurrentUser() : null;
  const saved = user ? await getSavedSchoolsForUser(user.id) : [];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Your list</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Saved schools
      </h1>

      <div className="mt-8">
        {!user ? (
          <EmptyState
            title="Log in to see your saved schools"
            body="Save schools from their profile pages to compare them later."
            href="/login?next=%2Fsaved"
            cta="Log in"
          />
        ) : saved.length === 0 ? (
          <EmptyState
            title="No saved schools yet"
            body="Tap Save on a school's page to add it here."
            href="/search"
            cta="Browse schools"
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map(({ school }) => (
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
