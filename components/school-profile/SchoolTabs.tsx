"use client";

import { useEffect, useRef } from "react";
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

export function SchoolTabs({
  schoolId,
  reviewCount,
  hasFacilities,
  hasDormitory,
}: {
  schoolId: string;
  reviewCount: number;
  /** False hides the Facilities tab: nothing is listed or rated yet. */
  hasFacilities: boolean;
  /** False hides the Dormitory tab: the school has none. */
  hasDormitory: boolean;
}) {
  const t = useTranslations("Profile");
  const pathname = usePathname();
  const base = `/school/${schoolId}`;
  const navRef = useRef<HTMLElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  // On a phone the row scrolls sideways: bring the tab you're on to the middle.
  // Only the row moves, never the page.
  useEffect(() => {
    const nav = navRef.current;
    const active = activeRef.current;
    if (!nav || !active) return;
    nav.scrollLeft = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
  }, [pathname]);

  const tabs = TABS.map((tab) => ({ ...tab, href: tab.segment ? `${base}/${tab.segment}` : base })).filter(
    (tab) =>
      // Someone who opened an empty section by its link still sees its tab.
      pathname === tab.href ||
      ((tab.segment !== "facilities" || hasFacilities) && (tab.segment !== "dorm" || hasDormitory))
  );

  return (
    <nav
      ref={navRef}
      aria-label={t("sections")}
      className="relative -mx-1 flex overflow-x-auto [scrollbar-width:none] max-sm:[mask-image:linear-gradient(to_right,black_calc(100%-1.75rem),transparent)]"
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.label}
            href={tab.href}
            ref={isActive ? activeRef : undefined}
            aria-current={isActive ? "page" : undefined}
            className={`relative flex min-h-12 items-center gap-2 whitespace-nowrap px-3.5 text-[0.9375rem] font-semibold transition-colors ${
              isActive ? "text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            {t(tab.label)}
            {tab.segment === "reviews" && reviewCount > 0 && (
              <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-xs tabular-nums text-muted">
                {reviewCount}
              </span>
            )}
            {/* The yellow "you are here" bar, same as the main navigation. */}
            {isActive && <span aria-hidden className="absolute inset-x-3.5 bottom-0 h-[3px] rounded-t bg-gold" />}
          </Link>
        );
      })}
    </nav>
  );
}
