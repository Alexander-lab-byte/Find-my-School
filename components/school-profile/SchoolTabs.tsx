"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Overview", segment: "" },
  { label: "Facilities", segment: "facilities" },
  { label: "Dormitory", segment: "dorm" },
  { label: "Admissions", segment: "admissions" },
  { label: "Reviews", segment: "reviews" },
];

export function SchoolTabs({ schoolId, reviewCount }: { schoolId: string; reviewCount: number }) {
  const pathname = usePathname();
  const base = `/school/${schoolId}`;

  return (
    <nav aria-label="School sections" className="-mb-px flex gap-1 overflow-x-auto">
      {TABS.map((tab) => {
        const href = tab.segment ? `${base}/${tab.segment}` : base;
        const isActive = pathname === href;

        return (
          <Link
            key={tab.label}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3.5 text-sm font-medium transition-colors sm:px-4 ${
              isActive
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:border-line-strong hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.segment === "reviews" && reviewCount > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs tabular-nums ${
                  isActive ? "bg-accent-soft text-accent" : "bg-surface-muted text-muted"
                }`}
              >
                {reviewCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
