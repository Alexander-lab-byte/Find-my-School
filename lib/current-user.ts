import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns the logged-in Prisma User, creating one on first sight of a new
 * Supabase auth user (so a signup doesn't require a separate "create your
 * profile" step). Returns null if nobody is logged in — callers decide
 * what to do with that (show a login prompt, throw, etc).
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

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
