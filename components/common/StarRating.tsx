const STAR_PATH =
  "M12 2.5l2.92 5.92 6.53.95-4.72 4.6 1.11 6.5L12 17.4l-5.84 3.07 1.11-6.5-4.72-4.6 6.53-.95z";

function StarRow() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" fill="currentColor" className="size-[1em] shrink-0">
          <path d={STAR_PATH} />
        </svg>
      ))}
    </>
  );
}

/**
 * Five stars filled to the exact fraction of `value` (4.3 → 86%), drawn as
 * a gold row clipped over a grey one. Purely visual — pair it with the
 * number as text so screen readers get the value.
 */
export function Stars({
  value,
  className = "",
}: {
  value: number | null | undefined;
  className?: string;
}) {
  const percent = value ? Math.min(100, Math.max(0, (value / 5) * 100)) : 0;

  return (
    <span className={`relative inline-flex shrink-0 ${className}`} aria-hidden>
      <span className="flex gap-[0.1em] text-star-empty">
        <StarRow />
      </span>
      <span
        className="absolute inset-y-0 left-0 flex gap-[0.1em] overflow-hidden text-star"
        style={{ width: `${percent}%` }}
      >
        <StarRow />
      </span>
    </span>
  );
}

type StarRatingProps = {
  value: number | null | undefined;
  count?: number;
  size?: "sm" | "md" | "lg";
};

const SIZE_CLASSES = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
};

export function StarRating({ value, count, size = "md" }: StarRatingProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${SIZE_CLASSES[size]}`}>
      <Stars value={value} />
      {value ? (
        <span className="text-[0.9em]">
          <span className="font-semibold text-foreground">{value.toFixed(1)}</span>
          {typeof count === "number" && (
            <span className="text-muted">
              {" "}
              ({count} {count === 1 ? "review" : "reviews"})
            </span>
          )}
        </span>
      ) : (
        <span className="text-[0.9em] text-muted">No reviews yet</span>
      )}
    </span>
  );
}
