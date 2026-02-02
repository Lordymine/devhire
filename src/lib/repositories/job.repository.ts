import { PrismaClient } from '@prisma/client';
import type {
  JobRepository,
  Job,
  CreateJobDto,
  UpdateJobDto,
  JobStatus,
} from '@/domains/job';

export class PrismaJobRepository implements JobRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Job | null> {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) return null;
    return this.mapToJob(job);
  }

  async findByCompanyId(companyId: string): Promise<Job[]> {
    const jobs = await this.prisma.job.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
    return jobs.map(this.mapToJob);
  }

  async findActive(): Promise<Job[]> {
    const jobs = await this.prisma.job.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    return jobs.map(this.mapToJob);
  }

  async findByStatus(status: JobStatus): Promise<Job[]> {
    const jobs = await this.prisma.job.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
    return jobs.map(this.mapToJob);
  }

  async findAll(filters?: {
    skills?: string[];
    remote?: boolean;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
  }): Promise<(Job & { company: { name: string; logo: string | null } })[]> {
    const where: Record<string, unknown> = { status: 'active' };

    if (filters?.skills && filters.skills.length > 0) {
      where.skills = { hasSome: filters.skills };
    }
    if (filters?.remote !== undefined) {
      where.remote = filters.remote;
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

    const jobs = await this.prisma.job.findMany({
      where,
      include: {
        company: {
          select: { name: true, logo: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return jobs.map((job) => ({
      ...this.mapToJob(job),
      company: job.company,
    }));
  }

  async findByIdWithCompany(id: string): Promise<(Job & { company: { id: string; name: string; logo: string | null; userId: string } }) | null> {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          select: { id: true, name: true, logo: true, userId: true },
        },
      },
    });
    if (!job) return null;
    return {
      ...this.mapToJob(job),
      company: job.company,
    };
  }

  async create(companyId: string, dto: CreateJobDto): Promise<Job> {
    const job = await this.prisma.job.create({
      data: {
        companyId,
        title: dto.title,
        description: dto.description,
        requirements: dto.requirements ?? [],
        skills: dto.skills ?? [],
        location: dto.location,
        remote: dto.remote ?? false,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        currency: dto.currency ?? 'BRL',
        type: dto.type,
        status: 'active',
      },
    });
    return this.mapToJob(job);
  }

  async update(id: string, dto: UpdateJobDto): Promise<Job> {
    const job = await this.prisma.job.update({
      where: { id },
      data: dto,
    });
    return this.mapToJob(job);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.job.delete({ where: { id } });
  }

  private mapToJob(job: {
    id: string;
    companyId: string;
    title: string;
    description: string;
    requirements: string[];
    skills: string[];
    location: string | null;
    remote: boolean;
    salaryMin: number | null;
    salaryMax: number | null;
    currency: string;
    type: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): Job {
    return {
      id: job.id,
      companyId: job.companyId,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      skills: job.skills,
      location: job.location,
      remote: job.remote,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      currency: job.currency,
      type: job.type as Job['type'],
      status: job.status as Job['status'],
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }
}
