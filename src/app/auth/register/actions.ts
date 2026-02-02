"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export type RegisterState = {
  error: string;
};

export async function registerDev(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const title = formData.get("title") as string | null;
  const skillsRaw = formData.get("skills") as string | null;
  const experience = formData.get("experience") as string | null;

  if (!email || !password || !name) {
    return { error: "Preencha todos os campos obrigatorios" };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Este email ja esta em uso" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const skills = skillsRaw
    ? skillsRaw.split(",").map((s) => s.trim())
    : [];

  try {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        type: "DEV",
        devProfile: {
          create: {
            title: title || undefined,
            skills,
            experience: experience || undefined,
          },
        },
      },
    });
  } catch {
    return { error: "Erro ao criar conta. Tente novamente." };
  }

  redirect("/auth/login?registered=true");
}

export async function registerCompany(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const companyName = formData.get("companyName") as string;
  const website = formData.get("website") as string | null;
  const size = formData.get("size") as string | null;

  if (!email || !password || !name || !companyName) {
    return { error: "Preencha todos os campos obrigatorios" };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Este email ja esta em uso" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        type: "COMPANY",
        companyProfile: {
          create: {
            name: companyName,
            website: website || undefined,
            size: size || undefined,
          },
        },
      },
    });
  } catch {
    return { error: "Erro ao criar conta. Tente novamente." };
  }

  redirect("/auth/login?registered=true");
}
