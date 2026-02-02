import prisma from '@/lib/prisma';
import {
  PrismaUserRepository,
  PrismaDevProfileRepository,
  PrismaCompanyProfileRepository,
} from './user.repository';
import { PrismaJobRepository } from './job.repository';
import { PrismaLikeRepository, PrismaMatchRepository } from './match.repository';

export const userRepository = new PrismaUserRepository(prisma);
export const devProfileRepository = new PrismaDevProfileRepository(prisma);
export const companyProfileRepository = new PrismaCompanyProfileRepository(prisma);
export const jobRepository = new PrismaJobRepository(prisma);
export const likeRepository = new PrismaLikeRepository(prisma);
export const matchRepository = new PrismaMatchRepository(prisma);

export {
  PrismaUserRepository,
  PrismaDevProfileRepository,
  PrismaCompanyProfileRepository,
  PrismaJobRepository,
  PrismaLikeRepository,
  PrismaMatchRepository,
};
