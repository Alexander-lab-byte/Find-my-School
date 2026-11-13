"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/common/Icon";
import { MAX_COMPARE, useCompare } from "@/lib/useCompare";

/**
 * The compare tray: appears at the bottom of every page once a school is
 * picked. Shows how many of the allowed schools are chosen, opens the
 * side-by-side view, and can empty the list in one tap.
 */
export function CompareBubble() {
  const t = useTranslations("Compare");
  const { ids, clear } = useCompare();
  const pathname = usePathname();

  if (ids.length === 0 || pathname.startsWith("/compare")) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div
        role="region"
        aria-label={t("bubble")}
        className="pop-in pointer-events-auto flex items-center gap-1.5 rounded-2xl border border-white/15 bg-band p-1.5 pl-4 text-white shadow-[var(--shadow-pop)]"
      >
        {/* One dot per slot, so it's clear how many more schools fit. */}
        <span aria-hidden className="flex gap-1">
          {Array.from({ length: MAX_COMPARE }, (_, i) => (
            <span key={i} className={`size-2.5 rounded-full ${i < ids.length ? "bg-gold" : "bg-white/25"}`} />
          ))}
        </span>
        <span className="mr-1 text-sm font-semibold tabular-nums" aria-live="polite">
          {t("trayCount", { count: ids.length, max: MAX_COMPARE })}
        </span>
        <Link href={`/compare?ids=${ids.join(",")}`} className="btn-gold btn-sm">
          <Icon name="columns" className="size-4" strokeWidth={2} />
          {t("bubble")}
        </Link>
        <button
          type="button"
          onClick={clear}
          aria-label={t("clear")}
          title={t("clear")}
          className="flex size-10 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Icon name="x" className="size-4" />
        </button>
      </div>
    </div>
  );
}
