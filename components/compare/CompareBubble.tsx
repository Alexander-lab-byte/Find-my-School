"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCompare } from "@/lib/useCompare";

export function CompareBubble() {
  const { ids } = useCompare();
  const pathname = usePathname();

  if (ids.length === 0 || pathname.startsWith("/compare")) return null;

  return (
    <Link
      href={`/compare?ids=${ids.join(",")}`}
      aria-label={`Compare ${ids.length} selected ${ids.length === 1 ? "school" : "schools"}`}
      className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M4 5h6v14H4zM14 5h6v14h-6z" />
      </svg>
      <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-background bg-amber-500 px-1 text-xs font-semibold text-white">
        {ids.length}
      </span>
    </Link>
  );
}
