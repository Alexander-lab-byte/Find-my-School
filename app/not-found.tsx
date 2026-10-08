import Link from "next/link";
import { Icon } from "@/components/common/Icon";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">404</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-foreground">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-2 text-muted">The link may be broken, or the page may have moved.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          <Icon name="search" className="size-4" />
          Browse schools
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
