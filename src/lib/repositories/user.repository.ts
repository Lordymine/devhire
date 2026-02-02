import { PrismaClient } from '@prisma/client';
import type {
  UserRepository,
  DevProfileRepository,
  CompanyProfileRepository,
  User,
  DevProfile,
  CompanyProfile,
  CreateUserDto,
  CreateDevProfileDto,
  CreateCompanyProfileDto,
} from '@/domains/user';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      type: user.type,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      type: user.type,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async create(dto: CreateUserDto): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        image: dto.image,
        type: dto.type,
      },
    });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      type: user.type,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async update(id: string, data: Partial<CreateUserDto>): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      type: user.type,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}

export class PrismaDevProfileRepository implements DevProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<DevProfile | null> {
    const profile = await this.prisma.devProfile.findUnique({ where: { id } });
    if (!profile) return null;
    return {
      id: profile.id,
      userId: profile.userId,
      title: profile.title,
      bio: profile.bio,
      skills: profile.skills,
      experience: profile.experience,
      portfolio: profile.portfolio,
      github: profile.github,
      linkedin: profile.linkedin,
      location: profile.location,
      salaryMin: profile.salaryMin,
      salaryMax: profile.salaryMax,
      currency: profile.currency,
    };
  }

  async findByUserId(userId: string): Promise<DevProfile | null> {
    const profile = await this.prisma.devProfile.findUnique({ where: { userId } });
    if (!profile) return null;
    return {
      id: profile.id,
      userId: profile.userId,
      title: profile.title,
      bio: profile.bio,
      skills: profile.skills,
      experience: profile.experience,
      portfolio: profile.portfolio,
      github: profile.github,
      linkedin: profile.linkedin,
      location: profile.location,
      salaryMin: profile.salaryMin,
      salaryMax: profile.salaryMax,
      currency: profile.currency,
    };
  }

  async findAll(filters?: {
    skills?: string[];
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
  }): Promise<(DevProfile & { user: { name: string | null; email: string; image: string | null } })[]> {
    const where: Record<string, unknown> = {};

    if (filters?.skills && filters.skills.length > 0) {
      where.skills = { hasSome: filters.skills };
    }
    if (filters?.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }
    if (filters?.salaryMin !== undefined) {
      where.salaryMax = { gte: filters.salaryMin };
    }
    if (filters?.salaryMax !== undefined) {
      where.salaryMin = { lte: filters.salaryMax };
    }

    const profiles = await this.prisma.devProfile.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true, image: true },
        },
      },
    });

    return profiles.map((profile) => ({
      id: profile.id,
      userId: profile.userId,
      title: profile.title,
      bio: profile.bio,
      skills: profile.skills,
      experience: profile.experience,
      portfolio: profile.portfolio,
      github: profile.github,
      linkedin: profile.linkedin,
      location: profile.location,
      salaryMin: profile.salaryMin,
      salaryMax: profile.salaryMax,
      currency: profile.currency,
      user: profile.user,
    }));
  }

  async create(userId: string, dto: CreateDevProfileDto): Promise<DevProfile> {
    const profile = await this.prisma.devProfile.create({
      data: {
        userId,
        title: dto.title,
        bio: dto.bio,
        skills: dto.skills ?? [],
        experience: dto.experience,
        portfolio: dto.portfolio,
        github: dto.github,
        linkedin: dto.linkedin,
        location: dto.location,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        currency: dto.currency ?? 'BRL',
      },
    });
    return {
      id: profile.id,
      userId: profile.userId,
      title: profile.title,
      bio: profile.bio,
      skills: profile.skills,
      experience: profile.experience,
      portfolio: profile.portfolio,
      github: profile.github,
      linkedin: profile.linkedin,
      location: profile.location,
      salaryMin: profile.salaryMin,
      salaryMax: profile.salaryMax,
      currency: profile.currency,
    };
  }

  async update(userId: string, data: Partial<CreateDevProfileDto>): Promise<DevProfile> {
    const profile = await this.prisma.devProfile.update({
      where: { userId },
      data,
    });
    return {
      id: profile.id,
      userId: profile.userId,
      title: profile.title,
      bio: profile.bio,
      skills: profile.skills,
      experience: profile.experience,
      portfolio: profile.portfolio,
      github: profile.github,
      linkedin: profile.linkedin,
      location: profile.location,
      salaryMin: profile.salaryMin,
      salaryMax: profile.salaryMax,
      currency: profile.currency,
    };
  }

  async delete(userId: string): Promise<void> {
    await this.prisma.devProfile.delete({ where: { userId } });
  }
}

export class PrismaCompanyProfileRepository implements CompanyProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<CompanyProfile | null> {
    const profile = await this.prisma.companyProfile.findUnique({ where: { id } });
    if (!profile) return null;
    return {
      id: profile.id,
      userId: profile.userId,
      name: profile.name,
      description: profile.description,
      website: profile.website,
      logo: profile.logo,
      size: profile.size,
      industry: profile.industry,
      location: profile.location,
    };
  }

  async findByUserId(userId: string): Promise<CompanyProfile | null> {
    const profile = await this.prisma.companyProfile.findUnique({ where: { userId } });
    if (!profile) return null;
    return {
      id: profile.id,
      userId: profile.userId,
      name: profile.name,
      description: profile.description,
      website: profile.website,
      logo: profile.logo,
      size: profile.size,
      industry: profile.industry,
      location: profile.location,
    };
  }

  async create(userId: string, dto: CreateCompanyProfileDto): Promise<CompanyProfile> {
    const profile = await this.prisma.companyProfile.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        website: dto.website,
        logo: dto.logo,
        size: dto.size,
        industry: dto.industry,
        location: dto.location,
      },
    });
    return {
      id: profile.id,
      userId: profile.userId,
      name: profile.name,
      description: profile.description,
      website: profile.website,
      logo: profile.logo,
      size: profile.size,
      industry: profile.industry,
      location: profile.location,
    };
  }

  async update(userId: string, data: Partial<CreateCompanyProfileDto>): Promise<CompanyProfile> {
    const profile = await this.prisma.companyProfile.update({
      where: { userId },
      data,
    });
    return {
      id: profile.id,
      userId: profile.userId,
      name: profile.name,
      description: profile.description,
      website: profile.website,
      logo: profile.logo,
      size: profile.size,
      industry: profile.industry,
      location: profile.location,
    };
  }

  async delete(userId: string): Promise<void> {
    await this.prisma.companyProfile.delete({ where: { userId } });
  }
}
