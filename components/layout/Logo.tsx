import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/common/Icon";

export function Logo() {
  const t = useTranslations("Common");

  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label={t("homeAria")}>
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 bg-accent text-accent-foreground shadow-[0_0_24px_-4px_rgb(255_181_71/0.7)]`}>
        <Icon name="graduation" className="size-4.5" />
      </span>
      <span className="leading-none">
        <span className={`block font-display text-base font-bold sm:text-lg text-foreground`}>
          {t("brand")}
        </span>
        <span className={`mt-1 hidden text-[10px] font-bold uppercase tracking-[0.18em] sm:block text-subtle`}>
          {t("tagline")}
        </span>
      </span>
    </Link>
  );
}
