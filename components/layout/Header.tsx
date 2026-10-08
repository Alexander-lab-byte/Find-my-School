import Link from "next/link";
import { headers } from "next/headers";
import { signOut } from "@/app/(auth)/actions";
import { Logo } from "@/components/layout/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";

export async function Header() {
  // Set by lib/supabase/middleware.ts — avoids a second network round
  // trip to Supabase's Auth server just to decide which nav links show.
  const isSignedIn = (await headers()).get("x-user-signed-in") === "1";

  return (
    <header className="relative border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Logo />

        <nav className="hidden items-center gap-4 text-sm md:flex">
          <Link
            href="/search"
            className="text-zinc-600 transition-colors hover:text-accent dark:text-zinc-400"
          >
            Search
          </Link>
          <Link
            href="/map"
            className="text-zinc-600 transition-colors hover:text-accent dark:text-zinc-400"
          >
            Map
          </Link>
          {isSignedIn && (
            <Link
              href="/saved"
              className="text-zinc-600 transition-colors hover:text-accent dark:text-zinc-400"
            >
              Saved
            </Link>
          )}
          {isSignedIn && (
            <>
              <Link
                href="/my-reviews"
                className="text-zinc-600 transition-colors hover:text-accent dark:text-zinc-400"
              >
                My reviews
              </Link>
              <Link
                href="/profile"
                className="text-zinc-600 transition-colors hover:text-accent dark:text-zinc-400"
              >
                Profile
              </Link>
            </>
          )}
          {isSignedIn ? (
            <form action={signOut}>
              <button
                type="submit"
                className="text-zinc-600 transition-colors hover:text-accent dark:text-zinc-400"
              >
                Log out
              </button>
            </form>
          ) : (
            <>
              <Link
                href="/login"
                className="text-zinc-600 transition-colors hover:text-accent dark:text-zinc-400"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-accent px-4 py-1.5 font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>

        <MobileMenu isSignedIn={isSignedIn} />
      </div>
    </header>
  );
}
