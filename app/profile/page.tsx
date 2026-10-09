import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { getAdminUser } from "@/lib/admin";
import { emailDomain, findSchoolForDomain, getVerifiedEmail } from "@/lib/review-access";
import { SIGNUP_ROLES, schoolNames } from "@/lib/labels";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { Badge } from "@/components/common/Badge";
import { Icon } from "@/components/common/Icon";
import { Fact, FactGrid } from "@/components/school-profile/ProfileSection";
import { updateProfile } from "@/app/profile/actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Account");
  return { title: t("title") };
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const t = await getTranslations("Account");
  const user = await getCurrentUser();
  if (!user) {
    return <LoginPrompt title={t("title")} message={t("loginMessage")} next="/profile" />;
  }

  const [{ saved, error }, reviewCount, savedCount, verifiedEmail, isAdmin, tRole, locale] = await Promise.all([
    searchParams,
    prisma.review.count({ where: { userId: user.id } }),
    prisma.savedSchool.count({ where: { userId: user.id } }),
    getVerifiedEmail(),
    getAdminUser().then(Boolean),
    getTranslations("Role"),
    getLocale(),
  ]);

  // Which school (if any) this person's verified email lets them review.
  const domain = verifiedEmail ? emailDomain(verifiedEmail) : null;
  const reviewSchool = domain ? await findSchoolForDomain(domain) : null;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{t("eyebrow")}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {user.name}
        </h1>
        <Badge tone={user.isVerified || isAdmin ? "verified" : "neutral"}>
          {tRole(isAdmin ? "ADMIN" : user.role)}
        </Badge>
      </div>

      <div className="mt-8">
        <FactGrid columns={3}>
          <Fact label={t("email")}>
            <span className="break-all">{user.email}</span>
          </Fact>
          <Fact label={t("reviews")}>
            <Link href="/my-reviews" className="text-accent hover:underline">
              {reviewCount}
            </Link>
          </Fact>
          <Fact label={t("savedSchools")}>
            <Link href="/saved" className="text-accent hover:underline">
              {savedCount}
            </Link>
          </Fact>
        </FactGrid>
      </div>

      {/* Can this person review? Explains the school-email rule in their own terms. */}
      <div className="mt-6 flex gap-3 rounded-xl border border-line bg-surface p-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Icon name={reviewSchool ? "shield" : "lock"} className="size-4.5" />
        </span>
        <div className="text-sm">
          <p className="font-medium text-foreground">{t("reviewAccessTitle")}</p>
          <p className="mt-1 leading-6 text-muted">
            {reviewSchool ? (
              <>
                {t("canReview", { school: schoolNames(reviewSchool, locale).primary })}{" "}
                <Link
                  href={`/school/${reviewSchool.id}/reviews#write-review`}
                  className="font-medium text-accent hover:underline"
                >
                  {t("writeReview")} →
                </Link>
              </>
            ) : (
              t("cannotReview", { domain: domain ?? "—" })
            )}
          </p>
        </div>
      </div>

      <form action={updateProfile} className="mt-6 space-y-5 rounded-xl border border-line bg-surface p-5">
        <h2 className="font-display text-xl font-semibold text-foreground">{t("editTitle")}</h2>
        {saved && (
          <p role="status" className="rounded-lg bg-accent-soft px-3 py-2.5 text-sm text-accent">
            {t("saved")}
          </p>
        )}
        {error === "name" && (
          <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2.5 text-sm text-danger">
            {t("nameRequired")}
          </p>
        )}

        <div>
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            {t("name")}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={60}
            defaultValue={user.name}
            className="field mt-1.5"
          />
        </div>

        {user.role !== "ADMIN" && (
          <div>
            <label htmlFor="role" className="text-sm font-medium text-foreground">
              {t("role")}
            </label>
            <select id="role" name="role" defaultValue={user.role} className="field mt-1.5">
              {SIGNUP_ROLES.map((r) => (
                <option key={r} value={r}>
                  {tRole(r)}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-subtle">{t("roleHint")}</p>
          </div>
        )}

        <button
          type="submit"
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          {t("save")}
        </button>
      </form>
    </main>
  );
}
