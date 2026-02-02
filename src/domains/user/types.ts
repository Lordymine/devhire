import { z } from 'zod';

export type UserType = 'DEV' | 'COMPANY';

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  type: UserType;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  name?: string;
  image?: string;
  type: UserType;
}

export interface DevProfile {
  id: string;
  userId: string;
  title: string | null;
  bio: string | null;
  skills: string[];
  experience: string | null;
  portfolio: string | null;
  github: string | null;
  linkedin: string | null;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
}

export interface CompanyProfile {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  website: string | null;
  logo: string | null;
  size: string | null;
  industry: string | null;
  location: string | null;
}

export interface CreateDevProfileDto {
  title?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  portfolio?: string;
  github?: string;
  linkedin?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
}

export interface CreateCompanyProfileDto {
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  size?: string;
  industry?: string;
  location?: string;
}

export const createUserSchema = z.object({
  email: z.email(),
  name: z.string().optional(),
  image: z.url().optional(),
  type: z.enum(['DEV', 'COMPANY']),
});

export const createDevProfileSchema = z.object({
  title: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional().default([]),
  experience: z.string().optional(),
  portfolio: z.url().optional(),
  github: z.url().optional(),
  linkedin: z.url().optional(),
  location: z.string().optional(),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  currency: z.string().optional().default('BRL'),
});

export const createCompanyProfileSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  website: z.url().optional(),
  logo: z.url().optional(),
  size: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
});
