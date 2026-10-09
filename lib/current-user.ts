import { cache } from "react";
import { Prisma, type UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SIGNUP_ROLES } from "@/lib/labels";
import { createClient } from "@/lib/supabase/server";

/**
 * The Supabase auth user for this request, verified with Supabase's Auth
 * server (never trust the cookie alone for authorization), plus how this
 * session was signed in. Cached so the header, the school layout, its
 * pages, and server actions share one network call per request.
 */
export const getAuthSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // getUser() just had Supabase verify this session's access token, so its
  // claims can be read without verifying them again.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return { user, signInMethods: session ? signInMethods(session.access_token) : [] };
});

export const getAuthUser = cache(async () => (await getAuthSession())?.user ?? null);

/** The token's `amr` claim: how the session was opened ("otp", "password", …). */
function signInMethods(accessToken: string): string[] {
  try {
    const payload = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64url").toString());
    const amr: unknown[] = Array.isArray(payload.amr) ? payload.amr : [];
    return amr.map((entry) =>
      typeof entry === "string" ? entry : String((entry as { method?: string }).method ?? "")
    );
  } catch {
    return [];
  }
}

// Ways in that only work for someone who can read the inbox. Supabase
// auto-confirms password sign-ups made straight against its API, so a
// "confirmed" email on a password session proves nothing.
const INBOX_METHODS = new Set(["otp", "magiclink", "email/signup", "invite", "recovery", "email_change"]);

/** True when this session was opened with an emailed code or link. */
export function provedInbox(methods: string[]) {
  return methods.some((m) => INBOX_METHODS.has(m));
}

/**
 * Returns the logged-in Prisma User, creating one on first sight of a new
 * Supabase auth user (so a signup doesn't require a separate "create your
 * profile" step). Returns null if nobody is logged in — callers decide
 * what to do with that (show a login prompt, throw, etc).
 */
export const getCurrentUser = cache(async () => {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  // Common case: returning user. A plain read, no write on every request.
  const existing = await prisma.user.findUnique({ where: { authId: authUser.id } });
  if (existing) return existing;

  const placeholderEmail = `${authUser.id}@unknown.local`;
  const name = authUser.user_metadata?.name ?? authUser.email?.split("@")[0] ?? "New user";
  // user_metadata is set by the browser, so only ever trust the self-service
  // roles from it — never ADMIN.
  const role: UserRole =
    SIGNUP_ROLES.find((r) => r === authUser.user_metadata?.role) ?? "PARENT";

  // A User row can already exist for this email (seeded, or the person
  // deleted and re-created their Supabase account). `email` is unique, so
  // creating a second row would crash. Re-link the old row only when
  // Supabase has verified the email — otherwise anyone could sign up with
  // someone else's address and inherit their reviews.
  if (authUser.email) {
    const byEmail = await prisma.user.findUnique({ where: { email: authUser.email } });
    if (byEmail) {
      if (authUser.email_confirmed_at) {
        return prisma.user.update({
          where: { id: byEmail.id },
          data: { authId: authUser.id },
        });
      }
      // Unverified email that's already taken: make a separate account
      // with a placeholder email instead of crashing or taking over.
      return createUser(authUser.id, placeholderEmail, name, role);
    }
  }

  return createUser(authUser.id, authUser.email ?? placeholderEmail, name, role);
});

async function createUser(authId: string, email: string, name: string, role: UserRole) {
  try {
    return await prisma.user.create({ data: { authId, email, name, role } });
  } catch (err) {
    // Two requests can race on a brand-new user; if the other one won,
    // just return the row it created.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const row = await prisma.user.findUnique({ where: { authId } });
      if (row) return row;
    }
    throw err;
  }
}
