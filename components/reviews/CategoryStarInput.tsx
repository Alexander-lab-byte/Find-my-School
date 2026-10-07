"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

// Keys in the "ReviewForm" namespace, from 1 star to 5.
const RATING_WORDS = ["poor", "fair", "good", "veryGood", "excellent"];

type CategoryStarInputProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
};

export function CategoryStarInput({ label, value, onChange, required }: CategoryStarInputProps) {
  const t = useTranslations("ReviewForm");
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm text-foreground">
        {label}
        {required && (
          <span className="text-accent" aria-hidden>
            {" "}
            *
          </span>
        )}
      </span>
      <div
        className="flex"
        role="group"
        aria-label={required ? `${label} ${t("required")}` : label}
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            aria-label={t("starLabel", { count: n, word: t(RATING_WORDS[n - 1]) })}
            aria-pressed={n === value}
            title={t(RATING_WORDS[n - 1])}
            className={`rounded p-0.5 transition-colors ${n <= shown ? "text-star" : "text-star-empty"}`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-5.5" aria-hidden>
              <path d="M12 2.5l2.92 5.92 6.53.95-4.72 4.6 1.11 6.5L12 17.4l-5.84 3.07 1.11-6.5-4.72-4.6 6.53-.95z" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
