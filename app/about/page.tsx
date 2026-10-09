import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Icon, type IconName } from "@/components/common/Icon";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("About");
  return { title: t("title") };
}

// [icon, title key, body key] — body text may contain <link> tags (see messages).
const SECTIONS: [IconName, string, string][] = [
  ["search", "useTitle", "useBody"],
  ["shield", "verifiedTitle", "verifiedBody"],
  ["trophy", "ratingsTitle", "ratingsBody"],
  ["message", "moderationTitle", "moderationBody"],
];

function inlineLink(href: string) {
  return function InlineLink(chunks: React.ReactNode) {
    return (
      <Link href={href} className="font-medium text-accent hover:underline">
        {chunks}
      </Link>
    );
  };
}

export default async function AboutPage() {
  const t = await getTranslations("About");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{t("eyebrow")}</p>
      <h1 className="mt-2 text-balance font-display text-4xl font-semibold tracking-tight text-foreground">
        {t("title")}
      </h1>
      <p className="mt-4 text-pretty text-lg leading-8 text-muted">{t("intro")}</p>

      <div className="mt-10 grid gap-4">
        {SECTIONS.map(([icon, title, body]) => (
          <section key={title} className="flex gap-4 rounded-xl border border-line bg-surface p-6">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Icon name={icon} className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">{t(title)}</h2>
              <p className="mt-2 leading-7 text-muted">
                {t.rich(body, {
                  search: inlineLink("/search"),
                  map: inlineLink("/map"),
                  compare: inlineLink("/compare"),
                  myReviews: inlineLink("/my-reviews"),
                })}
              </p>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
