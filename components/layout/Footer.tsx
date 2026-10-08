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
    ],
  },
];

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
            {t("about")}
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
              {t(column.title)}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {column.links.map(([key, href]) => (
                <li key={key}>
                  <Link href={href} className="text-muted transition-colors hover:text-accent">
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-subtle sm:flex-row sm:justify-between sm:px-6">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <p>{t("disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}
