import Link from "next/link";
import { useTranslations } from "next-intl";

export type AdminTab = "pending" | "published" | "rejected" | "reports";

const TABS: { key: AdminTab; href: string }[] = [
  { key: "pending", href: "/admin/reviews" },
  { key: "published", href: "/admin/reviews?status=published" },
  { key: "rejected", href: "/admin/reviews?status=rejected" },
  { key: "reports", href: "/admin/reports" },
];

/** Title and tabs shared by the admin pages; counts show what's waiting. */
export function AdminHeader({
  active,
  counts,
}: {
  active: AdminTab;
  counts: { pendingReviews: number; openReports: number };
}) {
  const t = useTranslations("Admin");
  const waiting: Partial<Record<AdminTab, number>> = {
    pending: counts.pendingReviews,
    reports: counts.openReports,
  };

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{t("eyebrow")}</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{t("intro")}</p>

      <nav aria-label={t("sections")} className="mt-6 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          const count = waiting[tab.key] ?? 0;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-2.5 py-3 text-sm font-medium transition-colors sm:px-4 ${
                isActive
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:border-line-strong hover:text-foreground"
              }`}
            >
              {t(`tab.${tab.key}`)}
              {count > 0 && (
                <span className="rounded-full bg-accent px-1.5 py-0.5 text-xs font-semibold tabular-nums text-accent-foreground">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
