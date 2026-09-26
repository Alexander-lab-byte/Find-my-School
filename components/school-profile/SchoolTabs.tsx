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

export function SchoolTabs({ schoolId }: { schoolId: string }) {
  const pathname = usePathname();
  const base = `/school/${schoolId}`;

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800">
      {TABS.map((tab) => {
        const href = tab.segment ? `${base}/${tab.segment}` : base;
        const isActive = pathname === href;

        return (
          <Link
            key={tab.label}
            href={href}
            className={`relative whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? "text-accent"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {tab.label}
            {isActive && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
