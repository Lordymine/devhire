"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function likeDev(devId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Voce precisa estar logado" };
  }

  if (session.user.type !== "COMPANY") {
    return { success: false, error: "Apenas empresas podem curtir devs" };
  }

  const companyProfile = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!companyProfile) {
    return { success: false, error: "Perfil de empresa nao encontrado" };
  }

  try {
    // Check if like already exists
    const existingLike = await prisma.like.findFirst({
      where: {
        fromCompanyId: companyProfile.id,
        toDevId: devId,
        type: "company_to_dev",
      },
    });

    if (existingLike) {
      return { success: true, error: null, alreadyLiked: true };
    }

    // Create like
    await prisma.like.create({
      data: {
        fromCompanyId: companyProfile.id,
        toDevId: devId,
        type: "company_to_dev",
      },
    });

    // Check if there's a mutual like (dev liked company)
    const mutualLike = await prisma.like.findFirst({
      where: {
        fromDevId: devId,
        toCompanyId: companyProfile.id,
        type: "dev_to_company",
      },
    });

    if (mutualLike) {
      // Create match
      await prisma.match.create({
        data: {
          devId,
          companyId: companyProfile.id,
        },
      });
      revalidatePath("/discovery");
      return { success: true, error: null, matched: true };
    }

    revalidatePath("/discovery");
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Erro ao curtir dev" };
  }
}

export async function likeCompany(companyId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Voce precisa estar logado" };
  }

  if (session.user.type !== "DEV") {
    return { success: false, error: "Apenas devs podem curtir empresas" };
  }

  const devProfile = await prisma.devProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!devProfile) {
    return { success: false, error: "Perfil de dev nao encontrado" };
  }

  try {
    // Check if like already exists
    const existingLike = await prisma.like.findFirst({
      where: {
        fromDevId: devProfile.id,
        toCompanyId: companyId,
        type: "dev_to_company",
      },
    });

    if (existingLike) {
      return { success: true, error: null, alreadyLiked: true };
    }

    // Create like
    await prisma.like.create({
      data: {
        fromDevId: devProfile.id,
        toCompanyId: companyId,
        type: "dev_to_company",
      },
    });

    // Check if there's a mutual like (company liked dev)
    const mutualLike = await prisma.like.findFirst({
      where: {
        fromCompanyId: companyId,
        toDevId: devProfile.id,
        type: "company_to_dev",
      },
    });

    if (mutualLike) {
      // Create match
      await prisma.match.create({
        data: {
          devId: devProfile.id,
          companyId,
        },
      });
      revalidatePath("/discovery");
      return { success: true, error: null, matched: true };
    }

    revalidatePath("/discovery");
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Erro ao curtir empresa" };
  }
}
