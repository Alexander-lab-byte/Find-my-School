"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@/components/common/Icon";
import { MAX_COMPARE, useCompare } from "@/lib/useCompare";

/**
 * A compact "Compare" checkbox for school cards. It sits on top of the
 * card's stretched link (z-10), so ticking it never opens the school.
 */
export function CompareCheckbox({ schoolId }: { schoolId: string }) {
  const t = useTranslations("Compare");
  const { has, isFull, toggle } = useCompare();
  const selected = has(schoolId);
  const blocked = isFull && !selected;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={() => toggle(schoolId)}
      disabled={blocked}
      title={blocked ? t("full", { max: MAX_COMPARE }) : undefined}
      className={`relative z-10 inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${
        selected
          ? "border-gold-foreground/40 bg-gold text-gold-foreground"
          : "border-line-strong bg-surface text-foreground hover:border-foreground"
      }`}
    >
      <span
        aria-hidden
        className={`flex size-4 items-center justify-center rounded-[4px] border-[1.5px] ${
          selected ? "border-gold-foreground bg-gold-foreground text-gold" : "border-subtle"
        }`}
      >
        {selected && <Icon name="check" className="size-3" strokeWidth={3.5} />}
      </span>
      {t("add")}
    </button>
  );
}
