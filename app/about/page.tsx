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
  ["info", "dataTitle", "dataBody"],
];

function inlineLink(href: string) {
  return function InlineLink(chunks: React.ReactNode) {
    return (
      <Link href={href} className="link">
        {chunks}
      </Link>
    );
  };
}

export default async function AboutPage() {
  const t = await getTranslations("About");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="page-title">{t("title")}</h1>
      <p className="mt-4 max-w-[65ch] text-pretty text-lg leading-8 text-muted">{t("intro")}</p>

      <div className="plate mt-8 divide-y divide-line">
        {SECTIONS.map(([icon, title, body]) => (
          <section key={title} className="flex gap-4 p-5 sm:p-6">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Icon name={icon} className="size-5" />
            </span>
            <div>
              <h2 className="section-title">{t(title)}</h2>
              <p className="mt-2 max-w-[65ch] leading-7 text-muted">
                {t.rich(body, {
                  search: inlineLink("/search"),
                  map: inlineLink("/map"),
                  compare: inlineLink("/compare"),
                  myReviews: inlineLink("/my-reviews"),
                  osm: (chunks) => (
                    <a
                      href="https://www.openstreetmap.org/copyright"
                      target="_blank"
                      rel="noreferrer"
                      className="link"
                    >
                      {chunks}
                    </a>
                  ),
                })}
              </p>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
