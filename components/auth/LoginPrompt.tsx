import Link from "next/link";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/common/EmptyState";

/** Full-page "please log in" state for account pages (profile, my reviews, saved). */
export function LoginPrompt({ title, message, next }: { title: string; message: string; next: string }) {
  const t = useTranslations("Common");

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 sm:px-6">
      <EmptyState as="h1" icon="lock" title={title} body={message}>
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="btn-primary">
          {t("logIn")}
        </Link>
      </EmptyState>
    </main>
  );
}
