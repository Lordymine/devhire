"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type ProfileState = {
  success: boolean;
  error: string;
};

export async function updateDevProfile(
  prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Voce precisa estar logado" };
  }

  const title = formData.get("title") as string | null;
  const bio = formData.get("bio") as string | null;
  const skillsRaw = formData.get("skills") as string | null;
  const experience = formData.get("experience") as string | null;
  const portfolio = formData.get("portfolio") as string | null;
  const github = formData.get("github") as string | null;
  const linkedin = formData.get("linkedin") as string | null;
  const location = formData.get("location") as string | null;
  const salaryMin = formData.get("salaryMin") as string | null;
  const salaryMax = formData.get("salaryMax") as string | null;

  const skills = skillsRaw
    ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  try {
    await prisma.devProfile.upsert({
      where: { userId: session.user.id },
      update: {
        title: title || undefined,
        bio: bio || undefined,
        skills,
        experience: experience || undefined,
        portfolio: portfolio || undefined,
        github: github || undefined,
        linkedin: linkedin || undefined,
        location: location || undefined,
        salaryMin: salaryMin ? parseInt(salaryMin, 10) : undefined,
        salaryMax: salaryMax ? parseInt(salaryMax, 10) : undefined,
      },
      create: {
        userId: session.user.id,
        title: title || undefined,
        bio: bio || undefined,
        skills,
        experience: experience || undefined,
        portfolio: portfolio || undefined,
        github: github || undefined,
        linkedin: linkedin || undefined,
        location: location || undefined,
        salaryMin: salaryMin ? parseInt(salaryMin, 10) : undefined,
        salaryMax: salaryMax ? parseInt(salaryMax, 10) : undefined,
      },
    });

    revalidatePath("/profile");
    return { success: true, error: "" };
  } catch {
    return { success: false, error: "Erro ao atualizar perfil" };
  }
}
