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
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
          saved
            ? "border-accent/40 bg-accent-soft text-accent"
            : "border-line bg-surface text-muted hover:border-line-strong hover:text-foreground"
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
        <p role="alert" className="text-right text-xs text-danger">
          {error}{" "}
          {error.toLowerCase().includes("log in") && (
            <Link
              href={`/login?next=${encodeURIComponent(`/school/${schoolId}`)}`}
              className="font-medium underline underline-offset-4"
            >
              Log in
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
