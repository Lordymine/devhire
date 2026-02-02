import { z } from 'zod';

export type JobType = 'CLT' | 'PJ' | 'Freelance';
export type JobStatus = 'active' | 'paused' | 'closed';

export interface Job {
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
  type: JobType;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJobDto {
  title: string;
  description: string;
  requirements?: string[];
  skills?: string[];
  location?: string;
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  type: JobType;
}

export interface UpdateJobDto {
  title?: string;
  description?: string;
  requirements?: string[];
  skills?: string[];
  location?: string;
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  type?: JobType;
  status?: JobStatus;
}

export const createJobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  requirements: z.array(z.string()).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
  location: z.string().optional(),
  remote: z.boolean().optional().default(false),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  currency: z.string().optional().default('BRL'),
  type: z.enum(['CLT', 'PJ', 'Freelance']),
}).refine(
  (data) => {
    if (data.salaryMin !== undefined && data.salaryMax !== undefined) {
      return data.salaryMin <= data.salaryMax;
    }
    return true;
  },
  { message: 'salaryMin must be less than or equal to salaryMax', path: ['salaryMin'] }
);

export const updateJobSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  requirements: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  currency: z.string().optional(),
  type: z.enum(['CLT', 'PJ', 'Freelance']).optional(),
  status: z.enum(['active', 'paused', 'closed']).optional(),
}).refine(
  (data) => {
    if (data.salaryMin !== undefined && data.salaryMax !== undefined) {
      return data.salaryMin <= data.salaryMax;
    }
    return true;
  },
  { message: 'salaryMin must be less than or equal to salaryMax', path: ['salaryMin'] }
);
