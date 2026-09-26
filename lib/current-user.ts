import { prisma } from "@/lib/prisma";

/**
 * TEMPORARY: there's no auth system yet (Supabase Auth is planned but not
 * wired up). This returns a single demo user so the review flow can be
 * built and tested end-to-end. Replace the body of this function with a
 * real session lookup once auth exists — everything that calls this
 * (the review server action) stays the same.
 */
export async function getCurrentUser() {
  return prisma.user.upsert({
    where: { email: "demo@findmyschool.mn" },
    update: {},
    create: {
      email: "demo@findmyschool.mn",
      name: "Demo Parent",
      role: "PARENT",
    },
  });
}
