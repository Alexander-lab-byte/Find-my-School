import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/layout/Logo";

// [message key, href] pairs; labels live in the "Footer" namespace.
const COLUMNS: { title: string; links: [key: string, href: string][] }[] = [
  {
    title: "explore",
    links: [
      ["allSchools", "/search"],
      ["schoolMap", "/map"],
      ["publicSchools", "/search?type=PUBLIC"],
      ["privateSchools", "/search?type=PRIVATE"],
      ["internationalSchools", "/search?type=INTERNATIONAL"],
      ["dormSchools", "/search?dorm=true"],
    ],
  },
  {
    title: "contribute",
    links: [
      ["reviewYourSchool", "/search"],
      ["createAccount", "/register"],
      ["logIn", "/login"],
      ["about", "/about"],
    ],
  },
];

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="relative mt-16 bg-foreground text-background">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-16 h-16 overflow-hidden">
        <div className="cloud absolute -left-10 top-4 h-24 w-72 opacity-90" />
        <div className="cloud absolute left-1/3 top-6 h-20 w-60 opacity-80" />
        <div className="cloud absolute right-0 top-2 h-28 w-80 opacity-90" />
      </div>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Logo inverted />
          <p className="mt-4 max-w-sm text-sm leading-6 text-background/70">
            {t("description")}
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-background/60">
              {t(column.title)}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {column.links.map(([key, href]) => (
                <li key={key}>
                  <Link href={href} className="text-background/80 transition-colors hover:text-gold">
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-background/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-background/60 sm:flex-row sm:justify-between sm:px-6">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <p>{t("disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}
