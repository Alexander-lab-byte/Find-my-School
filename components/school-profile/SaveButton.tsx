"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleSavedSchool } from "@/app/school/[id]/actions";

export function SaveButton({ schoolId, initialSaved }: { schoolId: string; initialSaved: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await toggleSavedSchool(schoolId);
        setSaved(result.saved);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={saved}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-50 ${
          saved
            ? "border-accent bg-accent/10 text-accent"
            : "border-zinc-200 text-zinc-600 hover:border-accent/40 dark:border-zinc-700 dark:text-zinc-400"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" strokeLinejoin="round" />
        </svg>
        {saved ? "Saved" : "Save"}
      </button>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {error}{" "}
          {error.toLowerCase().includes("log in") && (
            <Link
              href={`/login?next=${encodeURIComponent(`/school/${schoolId}`)}`}
              className="underline underline-offset-4">
              Log in
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
