"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

type ToggleSavedResult =
  | { ok: true; saved: boolean }
  | { ok: false; error: "LOGIN_REQUIRED" | "NOT_FOUND" };

export async function toggleSavedSchool(schoolId: string): Promise<ToggleSavedResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "LOGIN_REQUIRED" };

  const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { id: true } });
  if (!school) return { ok: false, error: "NOT_FOUND" };

  const existing = await prisma.savedSchool.findUnique({
    where: { userId_schoolId: { userId: user.id, schoolId } },
  });

  if (existing) {
    await prisma.savedSchool.delete({
      where: { userId_schoolId: { userId: user.id, schoolId } },
    });
  } else {
    await prisma.savedSchool.create({
      data: { userId: user.id, schoolId },
    });
  }

  revalidatePath(`/school/${schoolId}`);
  revalidatePath("/saved");

  return { ok: true, saved: !existing };
}
