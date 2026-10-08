"use client";

type CategoryStarInputProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
};

export function CategoryStarInput({ label, value, onChange, required }: CategoryStarInputProps) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-zinc-700 dark:text-zinc-300">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            aria-pressed={n === value}
            className={`text-xl leading-none transition-colors ${
              n <= value
                ? "text-amber-500"
                : "text-zinc-300 hover:text-amber-300 dark:text-zinc-700"
            }`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}
