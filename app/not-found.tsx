import Link from "next/link";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/common/EmptyState";

export default function NotFound() {
  const t = useTranslations("NotFound");
  const tCommon = useTranslations("Common");

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 sm:px-6">
      <EmptyState as="h1" icon="map" title={t("title")} body={t("body")}>
        <Link href="/search" className="btn-primary">
          {tCommon("browseSchools")}
        </Link>
        <Link href="/" className="btn-secondary">
          {tCommon("goHome")}
        </Link>
      </EmptyState>
    </main>
  );
}
