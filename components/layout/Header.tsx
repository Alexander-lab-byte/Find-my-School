import Link from "next/link";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/common/Icon";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { getCurrentUser } from "@/lib/current-user";
import { getAdminUser, getModerationCounts } from "@/lib/admin";
import { Logo } from "@/components/layout/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";

const NAV_LINK =
  "rounded-lg px-3 py-2 font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground";

export async function Header() {
  // Set by lib/supabase/middleware.ts — avoids a second network round
  // trip to Supabase's Auth server just to decide which nav links show.
  const isSignedIn = (await headers()).get("x-user-signed-in") === "1";
  const t = await getTranslations("Common");
  // Only signed-in visitors pay for the user lookup (name + admin flag for the menu).
  const user = isSignedIn ? await getCurrentUser() : null;
  const isAdmin = user ? Boolean(await getAdminUser()) : false;
  // Admins see how much is waiting for them on every page.
  const waiting = isAdmin ? (await getModerationCounts()).total : 0;

  return (
    <header className="relative border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 text-sm md:flex">
          <Link href="/search" className={`${NAV_LINK} flex items-center gap-2`}>
            <Icon name="search" className="size-4" />
            {t("browseSchools")}
          </Link>
          <Link href="/map" className={`${NAV_LINK} flex items-center gap-2`}>
            <Icon name="map" className="size-4" />
            {t("map")}
          </Link>
          {user ? (
            <AccountMenu name={user.name} isAdmin={isAdmin} waiting={waiting} />
          ) : (
            <>
              <Link href="/login" className={NAV_LINK}>
                {t("logIn")}
              </Link>
              <Link
                href="/register"
                className="ml-1 rounded-lg bg-accent px-4 py-2 font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
              >
                {t("signUp")}
              </Link>
            </>
          )}
          <LanguageSwitcher className="ml-2" />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <MobileMenu isSignedIn={Boolean(user)} isAdmin={isAdmin} waiting={waiting} />
        </div>
      </div>
    </header>
  );
}
