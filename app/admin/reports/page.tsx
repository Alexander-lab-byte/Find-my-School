import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { schoolNames } from "@/lib/labels";
import { EmptyNote } from "@/components/school-profile/ProfileSection";
import { dismissReport, hideReportedReview } from "@/app/admin/reports/actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Admin");
  return { title: t("title"), robots: { index: false } };
}

export default async function AdminReportsPage() {
  const user = await getCurrentUser();
  // Don't reveal that this page exists to anyone who isn't an admin.
  if (!user || user.role !== "ADMIN") notFound();

  const [reports, t, tReason, format, locale] = await Promise.all([
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
    getTranslations("Admin"),
    getTranslations("ReportReason"),
    getFormatter(),
    getLocale(),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{t("eyebrow")}</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted">{t("waiting", { count: reports.length })}</p>

      <div className="mt-8 space-y-4">
        {reports.length === 0 && <EmptyNote>{t("empty")}</EmptyNote>}

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

            <div className="mt-4 flex gap-3">
              <form action={hideReportedReview.bind(null, report.id)}>
                <button
                  type="submit"
                  className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  {t("hide")}
                </button>
              </form>
              <form action={dismissReport.bind(null, report.id)}>
                <button
                  type="submit"
                  className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
                >
                  {t("dismiss")}
                </button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
