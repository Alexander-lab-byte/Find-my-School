type StarRatingProps = {
  value: number | null | undefined;
  count?: number;
  size?: "sm" | "md" | "lg";
};

const SIZE_CLASSES = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl",
};

export function StarRating({ value, count, size = "md" }: StarRatingProps) {
  const rounded = value ? Math.round(value * 2) / 2 : 0;

  return (
    <span className={`inline-flex items-center gap-1.5 ${SIZE_CLASSES[size]}`}>
      <span className="text-amber-500" aria-hidden>
        {"★".repeat(Math.floor(rounded))}
        {rounded % 1 !== 0 ? "☆" : ""}
      </span>
      <span className="font-medium text-zinc-900 dark:text-zinc-100">
        {value ? value.toFixed(1) : "No ratings yet"}
      </span>
      {typeof count === "number" && (
        <span className="text-zinc-500">
          ({count} {count === 1 ? "review" : "reviews"})
        </span>
      )}
    </span>
  );
}
