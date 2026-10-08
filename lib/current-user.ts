import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/**
 * The Supabase auth user for this request, verified with Supabase's Auth
 * server (never trust the cookie alone for authorization). Cached so the
 * school layout, its pages, and server actions share one network call.
 */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Returns the logged-in Prisma User, creating one on first sight of a new
 * Supabase auth user (so a signup doesn't require a separate "create your
 * profile" step). Returns null if nobody is logged in — callers decide
 * what to do with that (show a login prompt, throw, etc).
 */
export async function getCurrentUser() {
  const authUser = await getAuthUser();

  if (!authUser) return null;

  return prisma.user.upsert({
    where: { authId: authUser.id },
    update: {},
    create: {
      authId: authUser.id,
      email: authUser.email ?? `${authUser.id}@unknown.local`,
      name: authUser.user_metadata?.name ?? authUser.email?.split("@")[0] ?? "New user",
    },
  });
}
