import Link from "next/link";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { getCurrentUser } from "@/lib/current-user";
import { getAdminUser, getModerationCounts } from "@/lib/admin";
import { Logo } from "@/components/layout/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { NavLinks, type NavItem } from "@/components/layout/NavLinks";

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

  // The three ways into the directory. Same list on desktop and in the phone menu.
  const items: NavItem[] = [
    { href: "/search", label: t("browseSchools") },
    { href: "/match", label: t("findMatch") },
    { href: "/map", label: t("map") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6 lg:gap-8">
        <Logo />
        <NavLinks items={items} label={t("mainNav")} />

        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <AccountMenu name={user.name} isAdmin={isAdmin} waiting={waiting} />
            ) : (
              <>
                <Link href="/login" className="btn-quiet btn-sm">
                  {t("logIn")}
                </Link>
                <Link href="/register" className="btn-primary btn-sm">
                  {t("signUp")}
                </Link>
              </>
            )}
          </div>
          <MobileMenu items={items} isSignedIn={Boolean(user)} isAdmin={isAdmin} waiting={waiting} />
        </div>
      </div>
    </header>
  );
}
