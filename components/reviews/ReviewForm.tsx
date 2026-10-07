"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { ReviewTag } from "@prisma/client";
import { CategoryStarInput } from "./CategoryStarInput";
import { submitReview } from "@/app/school/[id]/reviews/actions";

const TAG_OPTIONS: { value: ReviewTag; label: string }[] = [
  { value: "DORMITORY", label: "Dormitory" },
  { value: "LIBRARY", label: "Library" },
  { value: "FOOD_CANTEEN", label: "Food & Canteen" },
  { value: "EXTRACURRICULARS", label: "Extracurriculars" },
];

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
  const [error, setError] = useState<string | null>(null);
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
      setError("Please rate academics, facilities, teachers, and campus environment.");
      return;
    }
    if (bodyLength < MIN_BODY_LENGTH) {
      setError("Please write at least a couple of sentences.");
      return;
    }

    startTransition(async () => {
      try {
        await submitReview({
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
        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    });
  }

  if (success) {
    return (
      <div className="rounded-xl border border-accent/30 bg-accent-soft p-6 text-center">
        <p className="font-medium text-foreground">Thank you for your review</p>
        <p className="mt-1 text-sm text-muted">It&apos;s now live on this school&apos;s page.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-line bg-surface p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-subtle">Ratings</p>
        <div className="mt-1 divide-y divide-line">
          <CategoryStarInput
            label="Academics"
            value={ratings.academics}
            onChange={(v) => setRating("academics", v)}
            required
          />
          <CategoryStarInput
            label="Facilities"
            value={ratings.facilities}
            onChange={(v) => setRating("facilities", v)}
            required
          />
          <CategoryStarInput
            label="Teachers"
            value={ratings.teachers}
            onChange={(v) => setRating("teachers", v)}
            required
          />
          <CategoryStarInput
            label="Campus environment"
            value={ratings.environment}
            onChange={(v) => setRating("environment", v)}
            required
          />
          <CategoryStarInput
            label="Library"
            value={ratings.library}
            onChange={(v) => setRating("library", v)}
          />
          {hasDorm && (
            <CategoryStarInput
              label="Dormitory"
              value={ratings.dorms}
              onChange={(v) => setRating("dorms", v)}
            />
          )}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
          Topics <span className="font-normal normal-case tracking-normal">(optional)</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {TAG_OPTIONS.filter((t) => hasDorm || t.value !== "DORMITORY").map(({ value, label }) => (
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
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="review-body"
          className="text-xs font-semibold uppercase tracking-[0.12em] text-subtle"
        >
          Your review
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          placeholder="What stood out — teaching, atmosphere, facilities, communication with families?"
          className="field mt-2 resize-y leading-6"
        />
        <p
          className={`mt-1.5 text-xs ${bodyLength >= MIN_BODY_LENGTH ? "text-subtle" : "text-muted"}`}
        >
          {bodyLength >= MIN_BODY_LENGTH
            ? `${bodyLength} characters`
            : `${MIN_BODY_LENGTH - bodyLength} more characters needed`}
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2.5 text-sm text-danger">
          {error}
          {error.toLowerCase().includes("log in") && (
            <>
              {" "}
              <Link
                href={`/login?next=${encodeURIComponent(`/school/${schoolId}/reviews`)}`}
                className="font-medium underline underline-offset-4"
              >
                Log in
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
        {isPending ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
