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

// Message keys under Footer.members (names are spelled per language).
const TEAM = ["gunjid", "munkhjin", "anar", "temuulen", "enkhbold"];

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
            {t("description")}
          </p>
          <h2 className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
            {t("team")}
          </h2>
          <ul className="mt-3 flex max-w-sm flex-wrap gap-2">
            {TEAM.map((key) => {
              const name = t(`members.${key}`);
              return (
                <li
                  key={key}
                  className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 text-sm text-foreground"
                >
                  <span
                    aria-hidden
                    className="flex size-6 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent"
                  >
                    {name.charAt(0)}
                  </span>
                  {name}
                </li>
              );
            })}
          </ul>
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
