import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-lg font-semibold text-zinc-900 dark:text-zinc-100"
        >
          Find My School
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/search"
            className="text-zinc-600 transition-colors hover:text-accent dark:text-zinc-400"
          >
            Search
          </Link>
          {user ? (
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
      </div>
    </header>
  );
}
