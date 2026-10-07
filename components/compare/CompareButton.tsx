"use client";

import { MAX_COMPARE, useCompare } from "@/lib/useCompare";

export function CompareButton({ schoolId }: { schoolId: string }) {
  const { has, isFull, toggle } = useCompare();
  const selected = has(schoolId);
  const blocked = isFull && !selected;

  return (
    <button
      type="button"
      onClick={() => toggle(schoolId)}
      disabled={blocked}
      aria-pressed={selected}
      title={blocked ? `You can compare up to ${MAX_COMPARE} schools` : undefined}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        selected
          ? "border-accent bg-accent/10 text-accent"
          : "border-zinc-200 text-zinc-600 hover:border-accent/40 dark:border-zinc-700 dark:text-zinc-400"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill={selected ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M4 5h6v14H4zM14 5h6v14h-6z" />
      </svg>
      {selected ? "Added to compare" : "Compare"}
    </button>
  );
}
