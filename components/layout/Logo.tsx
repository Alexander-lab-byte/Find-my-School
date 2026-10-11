import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/common/Icon";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  const t = useTranslations("Common");

  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label={t("homeAria")}>
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 ${inverted ? "bg-gold text-gold-foreground" : "bg-foreground text-background"}`}>
        <Icon name="graduation" className="size-4.5" />
      </span>
      <span className="leading-none">
        <span className={`block font-display text-base font-bold sm:text-lg ${inverted ? "text-background" : "text-foreground"}`}>
          {t("brand")}
        </span>
        <span className={`mt-1 hidden text-[10px] font-bold uppercase tracking-[0.18em] sm:block ${inverted ? "text-background/60" : "text-subtle"}`}>
          {t("tagline")}
        </span>
      </span>
    </Link>
  );
}
