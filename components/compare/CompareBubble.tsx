"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/common/Icon";
import { useCompare } from "@/lib/useCompare";

/** Floating shortcut to the compare page once at least one school is picked. */
export function CompareBubble() {
  const t = useTranslations("Compare");
  const { ids } = useCompare();
  const pathname = usePathname();

  if (ids.length === 0 || pathname.startsWith("/compare")) return null;

  return (
    <Link
      href={`/compare?ids=${ids.join(",")}`}
      aria-label={t("bubbleLabel", { count: ids.length })}
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full bg-accent py-3 pl-4 pr-3 text-sm font-medium text-accent-foreground shadow-[0_16px_32px_-12px_rgb(0_0_0/0.45)] transition-transform hover:scale-[1.03]"
    >
      <Icon name="columns" className="size-4" strokeWidth={2} />
      {t("bubble")}
      <span className="flex size-6 items-center justify-center rounded-full bg-accent-foreground text-xs font-semibold text-accent">
        {ids.length}
      </span>
    </Link>
  );
}
