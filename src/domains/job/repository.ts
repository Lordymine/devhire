import type { Job, CreateJobDto, UpdateJobDto, JobStatus } from './types';

export interface JobRepository {
  findById(id: string): Promise<Job | null>;
  findByCompanyId(companyId: string): Promise<Job[]>;
  findActive(): Promise<Job[]>;
  findByStatus(status: JobStatus): Promise<Job[]>;
  create(companyId: string, dto: CreateJobDto): Promise<Job>;
  update(id: string, dto: UpdateJobDto): Promise<Job>;
  delete(id: string): Promise<void>;
}
