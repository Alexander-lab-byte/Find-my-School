"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { reportReview, type ReportReviewError } from "@/app/school/[id]/reviews/actions";
import { REPORT_REASONS, type ReportReason } from "@/lib/review-limits";

// Message key in the "Report" namespace for each error.
const ERROR_KEYS: Record<ReportReviewError | "GENERIC", string> = {
  LOGIN_REQUIRED: "loginRequired",
  INVALID_REASON: "chooseReason",
  NOT_FOUND: "notFound",
  OWN_REVIEW: "ownReview",
  ALREADY_REPORTED: "alreadyReported",
  GENERIC: "generic",
};

/** "Report" link that expands into a reason picker (Temuulen's moderation flow). */
export function ReportButton({ reviewId, schoolId }: { reviewId: string; schoolId: string }) {
  const t = useTranslations("Report");
  const tReason = useTranslations("ReportReason");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>(REPORT_REASONS[0]);
  const [error, setError] = useState<keyof typeof ERROR_KEYS | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result = await reportReview(reviewId, reason);
        if (result.ok) setDone(true);
        else setError(result.error);
      } catch {
        setError("GENERIC");
      }
    });
  }

  if (done) {
    return <span className="text-xs text-muted">{t("thanks")}</span>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-subtle underline-offset-4 transition-colors hover:text-accent hover:underline"
      >
        {t("report")}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center justify-end gap-2 text-xs">
      <label htmlFor={`report-${reviewId}`} className="sr-only">
        {t("reasonLabel")}
      </label>
      <select
        id={`report-${reviewId}`}
        value={reason}
        onChange={(e) => setReason(e.target.value as ReportReason)}
        className="field w-auto py-1.5 text-xs"
      >
        {REPORT_REASONS.map((r) => (
          <option key={r} value={r}>
            {tReason(r)}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-accent px-2.5 py-1.5 font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {isPending ? t("sending") : t("send")}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="px-1 text-muted hover:text-foreground"
      >
        {t("cancel")}
      </button>
      {error && (
        <span role="alert" className="w-full text-right text-danger">
          {t(ERROR_KEYS[error])}
          {error === "LOGIN_REQUIRED" && (
            <>
              {" "}
              <Link
                href={`/login?next=${encodeURIComponent(`/school/${schoolId}/reviews`)}`}
                className="font-medium underline underline-offset-4"
              >
                {t("logIn")}
              </Link>
            </>
          )}
        </span>
      )}
    </form>
  );
}
