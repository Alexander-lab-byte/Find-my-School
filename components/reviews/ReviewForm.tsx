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
    if (body.trim().length < 20) {
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
      <div className="rounded-[var(--radius-card)] border border-accent/30 bg-accent/5 p-6 text-center">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">Thanks for your review!</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          It&apos;s live on this school&apos;s page now.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-[var(--radius-card)] border border-zinc-200 p-5 dark:border-zinc-800"
    >
      <div>
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

      <div>
        <span className="text-sm text-zinc-700 dark:text-zinc-300">Tag your review (optional)</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {TAG_OPTIONS.filter((t) => hasDorm || t.value !== "DORMITORY").map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleTag(value)}
              aria-pressed={tags.includes(value)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                tags.includes(value)
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-zinc-200 text-zinc-600 hover:border-accent/40 dark:border-zinc-700 dark:text-zinc-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="review-body" className="text-sm text-zinc-700 dark:text-zinc-300">
          Your review
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          placeholder="What was your experience with this school?"
          className="mt-2 w-full rounded-lg border border-zinc-200 p-3 text-sm outline-none focus:border-accent dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
          {error.toLowerCase().includes("log in") && (
            <>
              {" "}
              <Link href="/login" className="underline underline-offset-4">
                Log in
              </Link>
            </>
          )}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
