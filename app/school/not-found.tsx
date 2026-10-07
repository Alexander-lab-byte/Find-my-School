import Link from "next/link";
import { Icon } from "@/components/common/Icon";

export default function SchoolNotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-muted text-subtle">
        <Icon name="search" className="size-5" />
      </span>
      <h1 className="mt-5 font-display text-3xl font-semibold text-foreground">
        We couldn&apos;t find that school
      </h1>
      <p className="mt-2 text-muted">
        It may have been removed, or the link might be out of date.
      </p>
      <Link
        href="/search"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
      >
        <Icon name="arrow-left" className="size-4" />
        Browse all schools
      </Link>
    </main>
  );
}
