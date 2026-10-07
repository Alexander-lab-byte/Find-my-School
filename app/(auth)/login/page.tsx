import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { safeNextPath } from "@/lib/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return { title: t("login") };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next: rawNext, error } = await searchParams;
  const next = safeNextPath(rawNext);
  const t = await getTranslations("Auth");
  const tCommon = await getTranslations("Common");
  const registerHref = next === "/" ? "/register" : `/register?next=${encodeURIComponent(next)}`;

  return (
    <AuthCard
      title={t("welcomeBack")}
      description={t("loginIntro")}
      footer={
        <>
          {t("noAccount")}{" "}
          <Link href={registerHref} className="font-medium text-accent underline-offset-4 hover:underline">
            {tCommon("signUp")}
          </Link>
        </>
      }
    >
      {error === "auth-callback-failed" && (
        <p role="alert" className="mb-6 rounded-lg bg-danger-soft px-3 py-2.5 text-sm text-danger">
          {t("callbackFailed")}
        </p>
      )}
      <LoginForm next={next} />
    </AuthCard>
  );
}
