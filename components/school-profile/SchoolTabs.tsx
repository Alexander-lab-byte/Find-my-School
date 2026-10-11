"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

// `label` is a key in the "Profile" message namespace.
const TABS = [
  { label: "overview", segment: "" },
  { label: "facilities", segment: "facilities" },
  { label: "dorm", segment: "dorm" },
  { label: "admissions", segment: "admissions" },
  { label: "reviews", segment: "reviews" },
];

export function SchoolTabs({ schoolId, reviewCount }: { schoolId: string; reviewCount: number }) {
  const t = useTranslations("Profile");
  const pathname = usePathname();
  const base = `/school/${schoolId}`;

  return (
    <nav aria-label={t("sections")} className="flex gap-1.5 overflow-x-auto py-3">
      {TABS.map((tab) => {
        const href = tab.segment ? `${base}/${tab.segment}` : base;
        const isActive = pathname === href;

        return (
          <Link
            key={tab.label}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
              isActive
                ? "bg-foreground text-background shadow-[0_10px_24px_-12px_rgba(11,18,32,.55)]"
                : "text-muted hover:bg-surface hover:text-foreground"
            }`}
          >
            {t(tab.label)}
            {tab.segment === "reviews" && reviewCount > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs tabular-nums ${
                  isActive ? "bg-gold text-gold-foreground" : "bg-surface-muted text-muted"
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
