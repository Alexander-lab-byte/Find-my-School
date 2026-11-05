import "server-only";
import { prisma } from "@/lib/prisma";
import { getAuthSession, getAuthUser, provedInbox } from "@/lib/current-user";

/**
 * Who may review a school: anyone who is signed in. Every review still waits
 * for an admin before it's public.
 *
 * A review gets the "Verified" badge only when the writer proved (by email
 * code) that they own an address on one of the school's `emailDomains`.
 * Everyone else — parents, students without a school email, schools with no
 * domain on file — can still review; their review shows as not verified.
 *
 * Everything here runs on the server — the UI uses it to show the form, and
 * submitReview calls it again so a hand-crafted request can't fake the badge.
 */

export type ReviewAccess =
  /** Nobody is signed in. `schoolDomains` lets the UI say which email earns the badge. */
  | { status: "signed-out"; schoolDomains: string[] }
  /**
   * Signed in, so they may review. `verified` is true when their proven email
   * is on one of the school's domains. `ownSchool` is the school their email
   * domain does match, if it's a different one.
   */
  | {
      status: "allowed";
      email: string;
      verified: boolean;
      schoolDomains: string[];
      ownSchool: { id: string; nameEn: string; nameMn: string | null } | null;
    };

/** "Name@Student.ASU.edu.mn" → "student.asu.edu.mn" */
export function emailDomain(email: string) {
  const at = email.lastIndexOf("@");
  return at === -1 ? null : email.slice(at + 1).trim().toLowerCase();
}

/** Exact domain or any subdomain of it ("student.asu.edu.mn" matches "asu.edu.mn"). */
export function domainMatches(domain: string, allowed: string[]) {
  return allowed.some((entry) => {
    const d = entry.trim().toLowerCase();
    return d !== "" && (domain === d || domain.endsWith(`.${d}`));
  });
}

/**
 * The signed-in user's email, only if they proved they own it: confirmed by
 * Supabase *and* this session was opened with an emailed code.
 */
export async function getVerifiedEmail() {
  const session = await getAuthSession();
  if (!session?.user.email || !session.user.email_confirmed_at) return null;
  if (!provedInbox(session.signInMethods)) return null;
  return session.user.email.toLowerCase();
}

/** True when the signed-in user proved an email on one of these domains. */
export async function isVerifiedFor(schoolDomains: string[]) {
  if (schoolDomains.length === 0) return false;
  const email = await getVerifiedEmail();
  const domain = email ? emailDomain(email) : null;
  return Boolean(domain && domainMatches(domain, schoolDomains));
}

export async function findSchoolForDomain(domain: string) {
  // Few schools and few domains: filter in memory rather than build a
  // suffix-matching SQL query.
  const schools = await prisma.school.findMany({
    where: { NOT: { emailDomains: { isEmpty: true } } },
    select: { id: true, nameEn: true, nameMn: true, emailDomains: true },
  });
  const match = schools.find((s) => domainMatches(domain, s.emailDomains));
  return match ? { id: match.id, nameEn: match.nameEn, nameMn: match.nameMn } : null;
}

export async function getReviewAccess(
  school: { id: string; emailDomains: string[] },
  { isSignedIn }: { isSignedIn: boolean }
): Promise<ReviewAccess> {
  const signedOut: ReviewAccess = { status: "signed-out", schoolDomains: school.emailDomains };

  // Skip the Supabase round trip entirely for logged-out visitors.
  if (!isSignedIn) return signedOut;

  const authUser = await getAuthUser();
  if (!authUser) return signedOut;

  const email = await getVerifiedEmail();
  const domain = email ? emailDomain(email) : null;
  const verified = Boolean(domain && domainMatches(domain, school.emailDomains));

  const ownSchool = !verified && domain ? await findSchoolForDomain(domain) : null;
  return {
    status: "allowed",
    email: email ?? authUser.email ?? "",
    verified,
    schoolDomains: school.emailDomains,
    ownSchool: ownSchool && ownSchool.id !== school.id ? ownSchool : null,
  };
}
