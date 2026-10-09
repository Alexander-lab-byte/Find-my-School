import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/common/Icon";

/** Full-page "please log in" state for account pages (profile, my reviews, saved). */
export function LoginPrompt({ title, message, next }: { title: string; message: string; next: string }) {
  const t = useTranslations("Common");

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-20 text-center sm:px-6">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon name="lock" className="size-5" />
      </span>
      <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="mt-2 text-muted">{message}</p>
      <Link
        href={`/login?next=${encodeURIComponent(next)}`}
        className="mt-8 inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
      >
        {t("logIn")}
      </Link>
    </main>
  );
}
