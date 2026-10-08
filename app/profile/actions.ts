"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { SIGNUP_ROLES } from "@/lib/labels";

export async function updateProfile(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");

  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  if (!name) redirect("/profile?error=name");

  // Admins keep their role; everyone else can only pick a self-service one.
  const role = SIGNUP_ROLES.find((r) => r === formData.get("role"));

  await prisma.user.update({
    where: { id: user.id },
    data: { name, ...(role && user.role !== "ADMIN" ? { role } : {}) },
  });

  revalidatePath("/profile");
  redirect("/profile?saved=1");
}
