"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type JobFormState = {
  success: boolean;
  error: string;
};

const parseOptionalInt = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const allowedStatuses = new Set(["active", "paused", "closed"]);

export async function createJob(
  prevState: JobFormState,
  formData: FormData
): Promise<JobFormState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Voce precisa estar logado" };
  }

  const companyProfile = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!companyProfile) {
    return { success: false, error: "Perfil de empresa nao encontrado" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const skillsRaw = formData.get("skills") as string | null;
  const requirementsRaw = formData.get("requirements") as string | null;
  const location = formData.get("location") as string | null;
  const remote = formData.get("remote") === "on";
  const salaryMinValue = parseOptionalInt(formData.get("salaryMin"));
  const salaryMaxValue = parseOptionalInt(formData.get("salaryMax"));
  const type = formData.get("type") as string;

  if (!title || !description || !type) {
    return { success: false, error: "Preencha os campos obrigatorios" };
  }

  const skills = skillsRaw
    ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const requirements = requirementsRaw
    ? requirementsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  if (
    salaryMinValue !== undefined &&
    salaryMaxValue !== undefined &&
    salaryMinValue > salaryMaxValue
  ) {
    return {
      success: false,
      error: "O salario minimo deve ser menor ou igual ao salario maximo",
    };
  }

  try {
    await prisma.job.create({
      data: {
        companyId: companyProfile.id,
        title,
        description,
        skills,
        requirements,
        location: location || undefined,
        remote,
        salaryMin: salaryMinValue,
        salaryMax: salaryMaxValue,
        type,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, error: "" };
  } catch {
    return { success: false, error: "Erro ao criar vaga" };
  }
}

export async function updateJobStatus(jobId: string, status: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Voce precisa estar logado" };
  }

  const companyProfile = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!companyProfile) {
    return { success: false, error: "Perfil de empresa nao encontrado" };
  }

  if (!allowedStatuses.has(status)) {
    return { success: false, error: "Status invalido" };
  }

  try {
    await prisma.job.update({
      where: {
        id: jobId,
        companyId: companyProfile.id,
      },
      data: { status },
    });

    revalidatePath("/dashboard");
    return { success: true, error: "" };
  } catch {
    return { success: false, error: "Erro ao atualizar vaga" };
  }
}

export async function deleteJob(jobId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Voce precisa estar logado" };
  }

  const companyProfile = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!companyProfile) {
    return { success: false, error: "Perfil de empresa nao encontrado" };
  }

  try {
    await prisma.job.delete({
      where: {
        id: jobId,
        companyId: companyProfile.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, error: "" };
  } catch {
    return { success: false, error: "Erro ao excluir vaga" };
  }
}
