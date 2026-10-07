import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

const COLUMNS: { title: string; links: [label: string, href: string][] }[] = [
  {
    title: "Explore",
    links: [
      ["All schools", "/search"],
      ["Public schools", "/search?type=PUBLIC"],
      ["Private schools", "/search?type=PRIVATE"],
      ["International schools", "/search?type=INTERNATIONAL"],
      ["Schools with dormitories", "/search?dorm=true"],
    ],
  },
  {
    title: "Contribute",
    links: [
      ["Review your school", "/search"],
      ["Create an account", "/register"],
      ["Log in", "/login"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
            An independent guide to schools in Mongolia — curriculum, fees, dormitories, and
            reviews from parents, students, alumni, and educators.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
              {column.title}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {column.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-muted transition-colors hover:text-accent">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-subtle sm:flex-row sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Find My School Mongolia</p>
          <p>Reviews reflect the views of individual community members.</p>
        </div>
      </div>
    </footer>
  );
}
