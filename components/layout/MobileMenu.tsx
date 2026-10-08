"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";

export function MobileMenu({ isSignedIn }: { isSignedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
      >
        {open ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-20 border-b border-zinc-200 bg-white px-6 py-4 shadow-sm dark:border-zinc-800 dark:bg-black">
          <nav className="flex flex-col gap-3 text-sm">
            <Link href="/search" onClick={() => setOpen(false)} className="text-zinc-600 dark:text-zinc-400">
              Search
            </Link>
            <Link href="/map" onClick={() => setOpen(false)} className="text-zinc-600 dark:text-zinc-400">
              Map
            </Link>
            {isSignedIn && (
              <Link href="/saved" onClick={() => setOpen(false)} className="text-zinc-600 dark:text-zinc-400">
                Saved schools
              </Link>
            )}
            {isSignedIn && (
              <>
                <Link href="/my-reviews" onClick={() => setOpen(false)} className="text-zinc-600 dark:text-zinc-400">
                  My reviews
                </Link>
                <Link href="/profile" onClick={() => setOpen(false)} className="text-zinc-600 dark:text-zinc-400">
                  Profile
                </Link>
              </>
            )}
            {isSignedIn ? (
              <form action={signOut}>
                <button type="submit" className="text-left text-zinc-600 dark:text-zinc-400">
                  Log out
                </button>
              </form>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="text-zinc-600 dark:text-zinc-400">
                  Log in
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="text-accent">
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
