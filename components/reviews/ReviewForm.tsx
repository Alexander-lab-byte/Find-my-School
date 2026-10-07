"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ReviewTag } from "@prisma/client";
import { CategoryStarInput } from "./CategoryStarInput";
import { submitReview } from "@/app/school/[id]/reviews/actions";

const TAG_OPTIONS: ReviewTag[] = ["DORMITORY", "LIBRARY", "FOOD_CANTEEN", "EXTRACURRICULARS"];

type FormError = "RATINGS" | "LENGTH" | "LOGIN_REQUIRED" | "ALREADY_REVIEWED" | "GENERIC";

// Message key in the "ReviewForm" namespace for each error.
const ERROR_KEYS: Record<FormError, string> = {
  RATINGS: "errorRatings",
  LENGTH: "errorLength",
  LOGIN_REQUIRED: "loginRequired",
  ALREADY_REVIEWED: "alreadyReviewed",
  GENERIC: "generic",
};

const MIN_BODY_LENGTH = 20;

type Ratings = {
  academics: number;
  facilities: number;
  teachers: number;
  environment: number;
  dorms: number;
  library: number;
};

export function ReviewForm({ schoolId, hasDorm }: { schoolId: string; hasDorm: boolean }) {
  const t = useTranslations("ReviewForm");
  const tRatings = useTranslations("Ratings");
  const tTag = useTranslations("ReviewTag");
  const [ratings, setRatings] = useState<Ratings>({
    academics: 0,
    facilities: 0,
    teachers: 0,
    environment: 0,
    dorms: 0,
    library: 0,
  });
  const [tags, setTags] = useState<ReviewTag[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState<FormError | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const bodyLength = body.trim().length;

  function setRating(key: keyof Ratings, value: number) {
    setRatings((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTag(tag: ReviewTag) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!ratings.academics || !ratings.facilities || !ratings.teachers || !ratings.environment) {
      setError("RATINGS");
      return;
    }
    if (bodyLength < MIN_BODY_LENGTH) {
      setError("LENGTH");
      return;
    }

    startTransition(async () => {
      try {
        const result = await submitReview({
          schoolId,
          bodyText: body.trim(),
          tags,
          academics: ratings.academics,
          facilities: ratings.facilities,
          teachers: ratings.teachers,
          environment: ratings.environment,
          dorms: hasDorm && ratings.dorms ? ratings.dorms : undefined,
          library: ratings.library || undefined,
        });
        if (result.ok) setSuccess(true);
        else setError(result.error);
      } catch {
        setError("GENERIC");
      }
    });
  }

  if (success) {
    return (
      <div className="rounded-xl border border-accent/30 bg-accent-soft p-6 text-center">
        <p className="font-medium text-foreground">{t("thanks")}</p>
        <p className="mt-1 text-sm text-muted">{t("live")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-line bg-surface p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-subtle">{t("ratings")}</p>
        <div className="mt-1 divide-y divide-line">
          <CategoryStarInput
            label={tRatings("academics")}
            value={ratings.academics}
            onChange={(v) => setRating("academics", v)}
            required
          />
          <CategoryStarInput
            label={tRatings("facilities")}
            value={ratings.facilities}
            onChange={(v) => setRating("facilities", v)}
            required
          />
          <CategoryStarInput
            label={tRatings("teachers")}
            value={ratings.teachers}
            onChange={(v) => setRating("teachers", v)}
            required
          />
          <CategoryStarInput
            label={tRatings("environment")}
            value={ratings.environment}
            onChange={(v) => setRating("environment", v)}
            required
          />
          <CategoryStarInput
            label={tRatings("library")}
            value={ratings.library}
            onChange={(v) => setRating("library", v)}
          />
          {hasDorm && (
            <CategoryStarInput
              label={tRatings("dorms")}
              value={ratings.dorms}
              onChange={(v) => setRating("dorms", v)}
            />
          )}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
          {t("topics")}{" "}
          <span className="font-normal normal-case tracking-normal">{t("optional")}</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {TAG_OPTIONS.filter((tag) => hasDorm || tag !== "DORMITORY").map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleTag(value)}
              aria-pressed={tags.includes(value)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                tags.includes(value)
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line text-muted hover:border-accent/40 hover:text-foreground"
              }`}
            >
              {tTag(value)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="review-body"
          className="text-xs font-semibold uppercase tracking-[0.12em] text-subtle"
        >
          {t("yourReview")}
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          placeholder={t("placeholder")}
          className="field mt-2 resize-y leading-6"
        />
        <p
          className={`mt-1.5 text-xs ${bodyLength >= MIN_BODY_LENGTH ? "text-subtle" : "text-muted"}`}
        >
          {bodyLength >= MIN_BODY_LENGTH
            ? t("charCount", { count: bodyLength })
            : t("moreChars", { count: MIN_BODY_LENGTH - bodyLength })}
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2.5 text-sm text-danger">
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
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {isPending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
