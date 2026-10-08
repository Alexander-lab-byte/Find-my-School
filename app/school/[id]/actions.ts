"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function toggleSavedSchool(schoolId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Please log in to save a school.");
  }

  const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { id: true } });
  if (!school) {
    throw new Error("School not found.");
  }

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

  return { saved: !existing };
}
