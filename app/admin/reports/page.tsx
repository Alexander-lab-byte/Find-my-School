import type { Metadata } from "next";
import Link from "next/link";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getModerationCounts, requireAdmin } from "@/lib/admin";
import { schoolNames } from "@/lib/labels";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ModerationButton } from "@/components/admin/ModerationButton";
import { EmptyNote } from "@/components/school-profile/ProfileSection";
import { dismissReport, hideReportedReview } from "@/app/admin/reports/actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Admin");
  return { title: t("title"), robots: { index: false } };
}

export default async function AdminReportsPage() {
  await requireAdmin();

  const [reports, counts, t, tReason, format, locale] = await Promise.all([
    prisma.report.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: {
        reporter: { select: { name: true } },
        review: {
          select: {
            bodyText: true,
            user: { select: { name: true } },
            school: { select: { id: true, nameEn: true, nameMn: true } },
          },
        },
      },
    }),
    getModerationCounts(),
    getTranslations("Admin"),
    getTranslations("ReportReason"),
    getFormatter(),
    getLocale(),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <AdminHeader active="reports" counts={counts} />

      <div className="mt-6 space-y-4">
        {reports.length === 0 && <EmptyNote>{t("emptyReports")}</EmptyNote>}

        {reports.map((report) => (
          <article key={report.id} className="rounded-xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <Link
                href={`/school/${report.review.school.id}/reviews`}
                className="font-medium text-foreground hover:text-accent"
              >
                {schoolNames(report.review.school, locale).primary}
              </Link>
              <span className="text-xs text-subtle">
                {format.dateTime(report.createdAt, { dateStyle: "medium" })}
              </span>
            </div>

            <p className="mt-1 text-xs text-subtle">
              {t("byline", { author: report.review.user.name, reporter: report.reporter.name })}
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {t("reason")}: {tReason.has(report.reason) ? tReason(report.reason) : report.reason}
            </p>

            <p className="mt-3 whitespace-pre-line rounded-lg bg-surface-muted p-3 text-sm text-muted wrap-anywhere">
              {report.review.bodyText}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <ModerationButton
                action={hideReportedReview.bind(null, report.id)}
                label={t("hide")}
                icon="x"
                variant="danger"
              />
              <ModerationButton
                action={dismissReport.bind(null, report.id)}
                label={t("dismiss")}
                icon="check"
                variant="secondary"
              />
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
