import Link from "next/link";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/common/EmptyState";

export default function SchoolNotFound() {
  const t = useTranslations("NotFound");

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 sm:px-6">
      <EmptyState as="h1" icon="search" title={t("schoolTitle")} body={t("schoolBody")}>
        <Link href="/search" className="btn-primary">
          {t("browseAll")}
        </Link>
      </EmptyState>
    </main>
  );
}
