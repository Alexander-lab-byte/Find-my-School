"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { setLocale } from "@/i18n/actions";
import { LOCALES } from "@/i18n/config";

const SHORT_NAMES = { en: "EN", mn: "МН" } as const;
const FULL_NAMES = { en: "English", mn: "Монгол" } as const;

/** Two-button EN / МН toggle. Saves the choice in a cookie and re-renders in place. */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const t = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function choose(next: string) {
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label={t("language")}
      className={`inline-flex rounded-lg border border-line bg-surface-muted p-0.5 text-xs font-semibold ${
        isPending ? "opacity-60" : ""
      } ${className}`}
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          onClick={() => choose(code)}
          aria-pressed={code === locale}
          aria-label={FULL_NAMES[code]}
          title={FULL_NAMES[code]}
          className={`rounded-md px-2.5 py-1 transition-colors ${
            code === locale
              ? "bg-surface text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.08)]"
              : "text-muted hover:text-foreground"
          }`}
        >
          {SHORT_NAMES[code]}
        </button>
      ))}
    </div>
  );
}
