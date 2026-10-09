"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@/components/common/Icon";
import { MAX_COMPARE, useCompare } from "@/lib/useCompare";

export function CompareButton({ schoolId }: { schoolId: string }) {
  const t = useTranslations("Compare");
  const { has, isFull, toggle } = useCompare();
  const selected = has(schoolId);
  const blocked = isFull && !selected;

  return (
    <button
      type="button"
      onClick={() => toggle(schoolId)}
      disabled={blocked}
      aria-pressed={selected}
      title={blocked ? t("full", { max: MAX_COMPARE }) : undefined}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        selected
          ? "border-accent/40 bg-accent-soft text-accent"
          : "border-line bg-surface text-muted hover:border-line-strong hover:text-foreground"
      }`}
    >
      <Icon name="columns" className="size-3.5" strokeWidth={2} />
      {selected ? t("added") : t("add")}
    </button>
  );
}
