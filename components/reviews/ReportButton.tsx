"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { reportReview } from "@/app/school/[id]/reviews/actions";
import { REPORT_REASONS } from "@/lib/review-limits";

export function ReportButton({ reviewId, schoolId }: { reviewId: string; schoolId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await reportReview(reviewId, reason);
        setDone(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  if (done) {
    return <span className="text-xs text-zinc-500">Thanks — we&apos;ll take a look.</span>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-zinc-400 underline-offset-4 transition-colors hover:text-accent hover:underline"
      >
        Report
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 text-xs">
      <label htmlFor={`report-${reviewId}`} className="sr-only">
        Reason for reporting
      </label>
      <select
        id={`report-${reviewId}`}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="rounded-md border border-zinc-200 bg-transparent px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
      >
        {REPORT_REASONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-accent px-2.5 py-1 font-medium text-accent-foreground disabled:opacity-50"
      >
        {isPending ? "Sending…" : "Send report"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-zinc-500 hover:text-accent">
        Cancel
      </button>
      {error && (
        <span className="w-full text-red-600 dark:text-red-400">
          {error}{" "}
          {error.toLowerCase().includes("log in") && (
            <Link
              href={`/login?next=${encodeURIComponent(`/school/${schoolId}/reviews`)}`}
              className="underline underline-offset-4"
            >
              Log in
            </Link>
          )}
        </span>
      )}
    </form>
  );
}
