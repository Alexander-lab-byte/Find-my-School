import Link from "next/link";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/layout/Logo";

type FooterLink = [key: string, href: string];

// [message key, href] pairs; labels live in the "Footer" namespace.
const EXPLORE: FooterLink[] = [
  ["allSchools", "/search"],
  ["findMatch", "/match"],
  ["schoolMap", "/map"],
  ["compare", "/compare"],
];

// The second column depends on whether someone is signed in.
const SIGNED_OUT: FooterLink[] = [
  ["reviewYourSchool", "/search"],
  ["createAccount", "/register"],
  ["logIn", "/login"],
  ["about", "/about"],
];
const SIGNED_IN: FooterLink[] = [
  ["reviewYourSchool", "/search"],
  ["savedSchools", "/saved"],
  ["myReviews", "/my-reviews"],
  ["about", "/about"],
];

export async function Footer() {
  const t = await getTranslations("Footer");
  // Set by lib/supabase/middleware.ts; only decides which links show.
  const isSignedIn = (await headers()).get("x-user-signed-in") === "1";
  const columns = [
    { title: "explore", links: EXPLORE },
    { title: "contribute", links: isSignedIn ? SIGNED_IN : SIGNED_OUT },
  ];

  return (
    <footer className="mt-20 bg-band text-white">
      {/* The three school lines and the destination, as one stripe. */}
      <div aria-hidden className="grid h-1.5 grid-cols-[3fr_2fr_1fr_1fr]">
        <span className="bg-band-public" />
        <span className="bg-band-private" />
        <span className="bg-band-intl" />
        <span className="bg-gold" />
      </div>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Logo inverted />
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">{t("description")}</p>
        </div>
        {columns.map((column) => (
          <nav key={column.title} aria-label={t(column.title)}>
            <h2 className="font-display text-sm font-semibold text-white">{t(column.title)}</h2>
            <ul className="mt-3 text-sm">
              {column.links.map(([key, href]) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="flex min-h-9 items-center text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline"
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-white/65 sm:flex-row sm:justify-between sm:px-6">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <p>{t("disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}
