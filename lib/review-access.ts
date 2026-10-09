import "server-only";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/current-user";

/**
 * Who may review a school: only people who proved (by email code) that they
 * own an address on one of the school's `emailDomains`. Everything here
 * runs on the server — the UI uses it to show or hide the form, and
 * submitReview calls it again so a hand-crafted request can't skip it.
 */

export type ReviewAccess =
  /** Nobody is signed in. `schoolDomains` lets the UI say which email to use. */
  | { status: "signed-out"; schoolDomains: string[] }
  /** The school has no verified email domain yet, so nobody can review it. */
  | { status: "closed" }
  /** Signed in with a verified email on one of the school's domains. */
  | { status: "allowed"; email: string }
  /**
   * Signed in, but the email doesn't belong to this school (or isn't
   * verified). `ownSchool` is the school their domain does match, if any.
   */
  | {
      status: "wrong-domain";
      email: string;
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

/** The signed-in user's email, only if Supabase has verified they own it. */
export async function getVerifiedEmail() {
  const user = await getAuthUser();
  if (!user?.email || !user.email_confirmed_at) return null;
  return user.email.toLowerCase();
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
  // Skip the Supabase round trip entirely for logged-out visitors.
  if (!isSignedIn) {
    return school.emailDomains.length === 0
      ? { status: "closed" }
      : { status: "signed-out", schoolDomains: school.emailDomains };
  }

  const authUser = await getAuthUser();
  if (!authUser) {
    return school.emailDomains.length === 0
      ? { status: "closed" }
      : { status: "signed-out", schoolDomains: school.emailDomains };
  }

  const email = await getVerifiedEmail();
  const domain = email ? emailDomain(email) : null;

  if (email && domain && domainMatches(domain, school.emailDomains)) {
    return { status: "allowed", email };
  }
  if (school.emailDomains.length === 0) return { status: "closed" };

  const ownSchool = domain ? await findSchoolForDomain(domain) : null;
  return {
    status: "wrong-domain",
    email: email ?? authUser.email ?? "",
    schoolDomains: school.emailDomains,
    ownSchool: ownSchool && ownSchool.id !== school.id ? ownSchool : null,
  };
}
