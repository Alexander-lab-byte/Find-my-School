"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string };

/** True when `pathname` is the link's page or a page under it (/school/… counts as /search). */
export function isCurrent(pathname: string, href: string) {
  if (href === "/search") return pathname.startsWith("/search") || pathname.startsWith("/school");
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Main navigation. The page you're on carries the yellow "you are here" bar. */
export function NavLinks({ items, label }: { items: NavItem[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="hidden h-full items-stretch gap-1 md:flex">
      {items.map(({ href, label: text }) => {
        const current = isCurrent(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={current ? "page" : undefined}
            className={`relative flex items-center px-3 text-[0.9375rem] font-semibold transition-colors ${
              current ? "text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            {text}
            {current && <span aria-hidden className="absolute inset-x-3 bottom-0 h-[3px] rounded-t bg-gold" />}
          </Link>
        );
      })}
    </nav>
  );
}
