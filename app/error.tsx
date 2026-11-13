"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/common/EmptyState";

export default function ErrorPage({
  error,
  retry,
  unstable_retry,
  reset,
}: {
  error: Error & { digest?: string };
  // Next versions have passed this callback as retry, unstable_retry, or reset.
  retry?: () => void;
  unstable_retry?: () => void;
  reset?: () => void;
}) {
  const tryAgain = retry ?? unstable_retry ?? reset;
  const t = useTranslations("Error");
  const tCommon = useTranslations("Common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 sm:px-6">
      <EmptyState as="h1" icon="info" title={t("title")} body={t("body")}>
        <button type="button" onClick={() => tryAgain?.()} className="btn-primary">
          {tCommon("tryAgain")}
        </button>
        <Link href="/" className="btn-secondary">
          {tCommon("goHome")}
        </Link>
      </EmptyState>
    </main>
  );
}
