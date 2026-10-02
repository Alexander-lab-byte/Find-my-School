"use client";

import { useRouter } from "next/navigation";

export function BackButton({
  fallbackHref,
  label = "Back",
}: {
  fallbackHref: string;
  label?: string;
}) {
  const router = useRouter();

  function handleClick() {
    // Prefer real browser history so applied search filters survive the
    // trip back. Only fall back to a plain link if there's nowhere to
    // go back to (e.g. someone opened this page from a shared link).
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-accent dark:text-zinc-400"
    >
      <span aria-hidden>←</span>
      {label}
    </button>
  );
}
