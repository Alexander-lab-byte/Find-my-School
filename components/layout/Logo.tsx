import Link from "next/link";
import { useTranslations } from "next-intl";

/** The mark: a route that bends and arrives at a yellow destination. */
export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" aria-hidden className={`shrink-0 ${className}`}>
      <rect width="36" height="36" rx="9" fill="#1b45d6" />
      <path
        d="M10 25.5h7.5a5.5 5.5 0 0 0 5.5-5.5v-3"
        fill="none"
        stroke="#fff"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="23" cy="11" r="4.5" fill="#ffc629" />
    </svg>
  );
}

export function Logo({ inverted = false }: { inverted?: boolean }) {
  const t = useTranslations("Common");
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={t("homeAria")}>
      <LogoMark />
      <span className="leading-none">
        <span
          className={`block whitespace-nowrap font-display text-base font-bold sm:text-[1.0625rem] ${inverted ? "text-white" : "text-foreground"}`}
        >
          {t("brand")}
        </span>
        <span className={`mt-1 hidden text-xs font-medium sm:block ${inverted ? "text-white/70" : "text-subtle"}`}>
          {t("tagline")}
        </span>
      </span>
    </Link>
  );
}
