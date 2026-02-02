"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

export type RegisterState = {
  error: string;
};

const registerDevSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  name: z.string().min(1, "Nome obrigatorio"),
  title: z.string().optional(),
  skills: z.string().optional(),
  experience: z.string().optional(),
});

const registerCompanySchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  name: z.string().min(1, "Nome obrigatorio"),
  companyName: z.string().min(1, "Nome da empresa obrigatorio"),
  website: z.string().url("Website invalido").optional(),
  size: z.string().optional(),
});

const readRequired = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const readOptional = (formData: FormData, key: string) => {
  const value = formData.get(key);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export async function registerDev(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = registerDevSchema.safeParse({
    email: readRequired(formData, "email"),
    password: readRequired(formData, "password"),
    name: readRequired(formData, "name"),
    title: readOptional(formData, "title"),
    skills: readOptional(formData, "skills"),
    experience: readOptional(formData, "experience"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados invalidos" };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    return { error: "Este email ja esta em uso" };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
  const skills = parsed.data.skills
    ? parsed.data.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  try {
    await prisma.user.create({
      data: {
        email: parsed.data.email,
        password: hashedPassword,
        name: parsed.data.name,
        type: "DEV",
        devProfile: {
          create: {
            title: parsed.data.title,
            skills,
            experience: parsed.data.experience,
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
  const parsed = registerCompanySchema.safeParse({
    email: readRequired(formData, "email"),
    password: readRequired(formData, "password"),
    name: readRequired(formData, "name"),
    companyName: readRequired(formData, "companyName"),
    website: readOptional(formData, "website"),
    size: readOptional(formData, "size"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados invalidos" };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    return { error: "Este email ja esta em uso" };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

  try {
    await prisma.user.create({
      data: {
        email: parsed.data.email,
        password: hashedPassword,
        name: parsed.data.name,
        type: "COMPANY",
        companyProfile: {
          create: {
            name: parsed.data.companyName,
            website: parsed.data.website,
            size: parsed.data.size,
          },
        },
      },
    });
  } catch {
    return { error: "Erro ao criar conta. Tente novamente." };
  }

  redirect("/auth/login?registered=true");
}
