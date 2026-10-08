import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { EmptyNote } from "@/components/school-profile/ProfileSection";
import { dismissReport, hideReportedReview } from "@/app/admin/reports/actions";

export const metadata = { title: "Reported reviews" };

export default async function AdminReportsPage() {
  const user = await getCurrentUser();
  // Don't reveal that this page exists to anyone who isn't an admin.
  if (!user || user.role !== "ADMIN") notFound();

  const reports = await prisma.report.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      reporter: { select: { name: true } },
      review: {
        select: {
          bodyText: true,
          user: { select: { name: true } },
          school: { select: { id: true, nameEn: true } },
        },
      },
    },
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-foreground">Reported reviews</h1>
      <p className="mt-2 text-sm text-muted">
        {reports.length} {reports.length === 1 ? "report" : "reports"} waiting.
      </p>

      <div className="mt-6 space-y-4">
        {reports.length === 0 && <EmptyNote>Nothing to review right now.</EmptyNote>}

        {reports.map((report) => (
          <article key={report.id} className="rounded-xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <Link
                href={`/school/${report.review.school.id}/reviews`}
                className="font-medium text-foreground hover:text-accent"
              >
                {report.review.school.nameEn}
              </Link>
              <span className="text-xs text-subtle">
                {new Date(report.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            <p className="mt-1 text-xs text-subtle">
              Review by {report.review.user.name} · reported by {report.reporter.name}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">Reason: {report.reason}</p>

            <p className="mt-3 whitespace-pre-line rounded-lg bg-surface-muted p-3 text-sm text-muted [overflow-wrap:anywhere]">
              {report.review.bodyText}
            </p>

            <div className="mt-4 flex gap-3">
              <form action={hideReportedReview.bind(null, report.id)}>
                <button
                  type="submit"
                  className="rounded-full bg-red-600 px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Hide review
                </button>
              </form>
              <form action={dismissReport.bind(null, report.id)}>
                <button
                  type="submit"
                  className="rounded-full border border-line px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
                >
                  Dismiss
                </button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
