import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/common/Icon";

export default function NotFound() {
  const t = useTranslations("NotFound");
  const tCommon = useTranslations("Common");

  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">404</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-foreground">
        {t("title")}
      </h1>
      <p className="mt-2 text-muted">{t("body")}</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          <Icon name="search" className="size-4" />
          {tCommon("browseSchools")}
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
        >
          {tCommon("goHome")}
        </Link>
      </div>
    </main>
  );
}
