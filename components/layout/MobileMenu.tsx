"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOut } from "@/app/(auth)/actions";
import { Icon } from "@/components/common/Icon";
import { isCurrent, type NavItem } from "@/components/layout/NavLinks";

const ITEM =
  "flex min-h-12 items-center justify-between rounded-lg px-3 font-semibold text-foreground transition-colors hover:bg-surface-muted";

export function MobileMenu({
  items,
  isSignedIn,
  isAdmin,
  waiting,
}: {
  items: NavItem[];
  isSignedIn: boolean;
  isAdmin: boolean;
  waiting: number;
}) {
  const t = useTranslations("Common");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // Escape closes the menu, like any other popup.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? t("closeMenu") : t("openMenu")}
        className="relative flex size-11 items-center justify-center rounded-lg border border-line-strong text-foreground transition-colors hover:bg-surface-muted"
      >
        {waiting > 0 && !open && (
          <span aria-hidden className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-surface bg-danger" />
        )}
        {open ? (
          <Icon name="x" className="size-5" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="pop-in absolute inset-x-0 top-full z-30 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-line bg-surface px-4 py-3 shadow-[var(--shadow-pop)]"
        >
          <nav aria-label={t("mainNav")} className="flex flex-col">
            {[...items, { href: "/about", label: t("about") }].map(({ href, label }) => {
              const current = isCurrent(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  aria-current={current ? "page" : undefined}
                  className={ITEM}
                >
                  {label}
                  {current && <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-gold" />}
                </Link>
              );
            })}
            {isSignedIn && (
              <>
                <div className="my-2 border-t border-line" />
                <Link href="/saved" onClick={close} className={ITEM}>
                  {t("savedSchools")}
                </Link>
                <Link href="/my-reviews" onClick={close} className={ITEM}>
                  {t("myReviews")}
                </Link>
                <Link href="/profile" onClick={close} className={ITEM}>
                  {t("profile")}
                </Link>
                {isAdmin && (
                  <Link href="/admin/reviews" onClick={close} className={ITEM}>
                    {t("moderation")}
                    {waiting > 0 && (
                      <span className="rounded-md bg-accent px-1.5 py-0.5 text-xs font-semibold tabular-nums text-accent-foreground">
                        {waiting}
                      </span>
                    )}
                  </Link>
                )}
              </>
            )}
            <div className="my-2 border-t border-line" />
            {isSignedIn ? (
              <form action={signOut}>
                <button type="submit" className={`${ITEM} w-full text-left`}>
                  {t("logOut")}
                </button>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-2 py-1">
                <Link href="/login" onClick={close} className="btn-secondary">
                  {t("logIn")}
                </Link>
                <Link href="/register" onClick={close} className="btn-primary">
                  {t("signUp")}
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
