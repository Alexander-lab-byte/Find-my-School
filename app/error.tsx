"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  retry,
  unstable_retry,
  reset,
}: {
  error: Error & { digest?: string };
  // Different Next versions pass the "try again" callback under different
  // names; accept any of them so the button works whichever one this is.
  retry?: () => void;
  unstable_retry?: () => void;
  reset?: () => void;
}) {
  const tryAgain = retry ?? unstable_retry ?? reset;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-foreground">
        Something went wrong
      </h1>
      <p className="mt-2 text-muted">
        We couldn&apos;t load this page. This is usually temporary — please try again.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => tryAgain?.()}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          Try again
        </button>
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
