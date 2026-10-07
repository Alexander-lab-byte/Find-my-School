"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { Icon } from "@/components/common/Icon";

const ITEM =
  "rounded-lg px-3 py-2.5 font-medium text-foreground transition-colors hover:bg-surface-muted";

export function MobileMenu({ isSignedIn }: { isSignedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex size-9 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:bg-surface-muted"
      >
        {open ? (
          <Icon name="x" className="size-4.5" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-4.5" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-30 border-b border-line bg-surface px-4 py-3 shadow-[0_16px_32px_-20px_rgb(0_0_0/0.3)]">
          <nav className="flex flex-col text-sm">
            <Link href="/search" onClick={close} className={ITEM}>
              Browse schools
            </Link>
            {isSignedIn && (
              <Link href="/saved" onClick={close} className={ITEM}>
                Saved schools
              </Link>
            )}
            {isSignedIn ? (
              <form action={signOut}>
                <button type="submit" className={`${ITEM} w-full text-left`}>
                  Log out
                </button>
              </form>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-line pt-3">
                <Link
                  href="/login"
                  onClick={close}
                  className="rounded-lg border border-line px-3 py-2.5 text-center font-medium text-foreground"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={close}
                  className="rounded-lg bg-accent px-3 py-2.5 text-center font-medium text-accent-foreground"
                >
                  Sign up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
