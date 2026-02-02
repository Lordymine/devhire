import type { Like, Match, CreateLikeDto, CreateMatchDto, MatchStatus } from './types';

export interface LikeRepository {
  findById(id: string): Promise<Like | null>;
  findByDevAndCompany(devId: string, companyId: string): Promise<Like | null>;
  findByCompanyAndDev(companyId: string, devId: string): Promise<Like | null>;
  findByFromUser(userId: string, type: 'DEV' | 'COMPANY'): Promise<Like[]>;
  create(dto: CreateLikeDto): Promise<Like>;
  delete(id: string): Promise<void>;
}

export interface MatchRepository {
  findById(id: string): Promise<Match | null>;
  findByDevAndCompany(devId: string, companyId: string): Promise<Match | null>;
  findByDevId(devId: string): Promise<Match[]>;
  findByCompanyId(companyId: string): Promise<Match[]>;
  create(dto: CreateMatchDto): Promise<Match>;
  updateStatus(id: string, status: MatchStatus): Promise<Match>;
  delete(id: string): Promise<void>;
}
