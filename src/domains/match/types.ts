import { z } from 'zod';

export type LikeType = 'dev_to_company' | 'company_to_dev';

export interface Like {
  id: string;
  fromDevId: string | null;
  fromCompanyId: string | null;
  toDevId: string | null;
  toCompanyId: string | null;
  type: LikeType;
  createdAt: Date;
}

export type MatchStatus = 'active' | 'closed';

export interface Match {
  id: string;
  devId: string;
  companyId: string;
  status: MatchStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLikeDto {
  fromDevId?: string;
  fromCompanyId?: string;
  toDevId?: string;
  toCompanyId?: string;
  type: LikeType;
}

export interface CreateMatchDto {
  devId: string;
  companyId: string;
}

export const createLikeSchema = z.object({
  fromDevId: z.string().optional(),
  fromCompanyId: z.string().optional(),
  toDevId: z.string().optional(),
  toCompanyId: z.string().optional(),
  type: z.enum(['dev_to_company', 'company_to_dev']),
}).refine(
  (data) => {
    if (data.type === 'dev_to_company') {
      return !!data.fromDevId && !!data.toCompanyId;
    }
    return !!data.fromCompanyId && !!data.toDevId;
  },
  { message: 'Invalid like configuration for the specified type' }
);

export const createMatchSchema = z.object({
  devId: z.string().min(1),
  companyId: z.string().min(1),
});
