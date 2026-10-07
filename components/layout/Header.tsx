import Link from "next/link";
import { headers } from "next/headers";
import { signOut } from "@/app/(auth)/actions";
import { Icon } from "@/components/common/Icon";
import { Logo } from "@/components/layout/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";

const NAV_LINK =
  "rounded-lg px-3 py-2 font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground";

export async function Header() {
  // Set by lib/supabase/middleware.ts — avoids a second network round
  // trip to Supabase's Auth server just to decide which nav links show.
  const isSignedIn = (await headers()).get("x-user-signed-in") === "1";

  return (
    <header className="relative border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 text-sm md:flex">
          <Link href="/search" className={`${NAV_LINK} flex items-center gap-2`}>
            <Icon name="search" className="size-4" />
            Browse schools
          </Link>
          {isSignedIn && (
            <Link href="/saved" className={NAV_LINK}>
              Saved
            </Link>
          )}
          {isSignedIn ? (
            <form action={signOut}>
              <button type="submit" className={NAV_LINK}>
                Log out
              </button>
            </form>
          ) : (
            <>
              <Link href="/login" className={NAV_LINK}>
                Log in
              </Link>
              <Link
                href="/register"
                className="ml-1 rounded-lg bg-accent px-4 py-2 font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
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
