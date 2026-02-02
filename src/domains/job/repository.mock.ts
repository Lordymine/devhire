import type { Job, CreateJobDto, UpdateJobDto, JobStatus } from './types';
import type { JobRepository } from './repository';

export class MockJobRepository implements JobRepository {
  jobs: Job[] = [];
  private idCounter = 1;

  async findById(id: string): Promise<Job | null> {
    return this.jobs.find((j) => j.id === id) ?? null;
  }

  async findByCompanyId(companyId: string): Promise<Job[]> {
    return this.jobs.filter((j) => j.companyId === companyId);
  }

  async findActive(): Promise<Job[]> {
    return this.jobs.filter((j) => j.status === 'active');
  }

  async findByStatus(status: JobStatus): Promise<Job[]> {
    return this.jobs.filter((j) => j.status === status);
  }

  async create(companyId: string, dto: CreateJobDto): Promise<Job> {
    const job: Job = {
      id: `job-${this.idCounter++}`,
      companyId,
      title: dto.title,
      description: dto.description,
      requirements: dto.requirements ?? [],
      skills: dto.skills ?? [],
      location: dto.location ?? null,
      remote: dto.remote ?? false,
      salaryMin: dto.salaryMin ?? null,
      salaryMax: dto.salaryMax ?? null,
      currency: dto.currency ?? 'BRL',
      type: dto.type,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.jobs.push(job);
    return job;
  }

  async update(id: string, dto: UpdateJobDto): Promise<Job> {
    const index = this.jobs.findIndex((j) => j.id === id);
    if (index === -1) {
      throw new Error(`Job with id ${id} not found`);
    }
    this.jobs[index] = {
      ...this.jobs[index],
      ...dto,
      updatedAt: new Date(),
    };
    return this.jobs[index];
  }

  async delete(id: string): Promise<void> {
    const index = this.jobs.findIndex((j) => j.id === id);
    if (index !== -1) {
      this.jobs.splice(index, 1);
    }
  }
}
