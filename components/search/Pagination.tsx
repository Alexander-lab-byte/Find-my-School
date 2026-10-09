import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/common/Icon";

type PaginationProps = {
  page: number;
  pageCount: number;
  /** Current search params, so paging keeps the active filters. */
  params: Record<string, string | string[] | undefined>;
};

function hrefFor(params: PaginationProps["params"], page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "page" || value === undefined) continue;
    search.set(key, Array.isArray(value) ? value[0] : value);
  }
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  return qs ? `/search?${qs}` : "/search";
}

const BUTTON =
  "flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-line-strong hover:bg-surface-muted";

export function Pagination({ page, pageCount, params }: PaginationProps) {
  const t = useTranslations("Pagination");
  if (pageCount <= 1) return null;

  return (
    <nav aria-label={t("label")} className="flex items-center justify-between gap-4">
      {page > 1 ? (
        <Link href={hrefFor(params, page - 1)} className={BUTTON}>
          <Icon name="chevron-left" className="size-4" />
          {t("previous")}
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-muted">
        {t("page", { page, count: pageCount })}
      </p>
      {page < pageCount ? (
        <Link href={hrefFor(params, page + 1)} className={BUTTON}>
          {t("next")}
          <Icon name="chevron-right" className="size-4" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
