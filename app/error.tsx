"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("Error");
  const tCommon = useTranslations("Common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-foreground">
        {t("title")}
      </h1>
      <p className="mt-2 text-muted">
        {t("body")}
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          {tCommon("tryAgain")}
        </button>
        <Link
          href="/"
          className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
        >
          {tCommon("goHome")}
        </Link>
      </div>
    </main>
  );
}
