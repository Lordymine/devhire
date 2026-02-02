import type { Like, Match, CreateLikeDto, CreateMatchDto, MatchStatus } from './types';
import type { LikeRepository, MatchRepository } from './repository';

export class MockLikeRepository implements LikeRepository {
  likes: Like[] = [];
  private idCounter = 1;

  async findById(id: string): Promise<Like | null> {
    return this.likes.find((l) => l.id === id) ?? null;
  }

  async findByDevAndCompany(devId: string, companyId: string): Promise<Like | null> {
    return (
      this.likes.find(
        (l) => l.fromDevId === devId && l.toCompanyId === companyId && l.type === 'dev_to_company'
      ) ?? null
    );
  }

  async findByCompanyAndDev(companyId: string, devId: string): Promise<Like | null> {
    return (
      this.likes.find(
        (l) => l.fromCompanyId === companyId && l.toDevId === devId && l.type === 'company_to_dev'
      ) ?? null
    );
  }

  async findByFromUser(userId: string, type: 'DEV' | 'COMPANY'): Promise<Like[]> {
    if (type === 'DEV') {
      return this.likes.filter((l) => l.fromDevId === userId);
    }
    return this.likes.filter((l) => l.fromCompanyId === userId);
  }

  async create(dto: CreateLikeDto): Promise<Like> {
    const like: Like = {
      id: `like-${this.idCounter++}`,
      fromDevId: dto.fromDevId ?? null,
      fromCompanyId: dto.fromCompanyId ?? null,
      toDevId: dto.toDevId ?? null,
      toCompanyId: dto.toCompanyId ?? null,
      type: dto.type,
      createdAt: new Date(),
    };
    this.likes.push(like);
    return like;
  }

  async delete(id: string): Promise<void> {
    const index = this.likes.findIndex((l) => l.id === id);
    if (index !== -1) {
      this.likes.splice(index, 1);
    }
  }
}

export class MockMatchRepository implements MatchRepository {
  matches: Match[] = [];
  private idCounter = 1;

  async findById(id: string): Promise<Match | null> {
    return this.matches.find((m) => m.id === id) ?? null;
  }

  async findByDevAndCompany(devId: string, companyId: string): Promise<Match | null> {
    return (
      this.matches.find((m) => m.devId === devId && m.companyId === companyId) ?? null
    );
  }

  async findByDevId(devId: string): Promise<Match[]> {
    return this.matches.filter((m) => m.devId === devId);
  }

  async findByCompanyId(companyId: string): Promise<Match[]> {
    return this.matches.filter((m) => m.companyId === companyId);
  }

  async create(dto: CreateMatchDto): Promise<Match> {
    const match: Match = {
      id: `match-${this.idCounter++}`,
      devId: dto.devId,
      companyId: dto.companyId,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.matches.push(match);
    return match;
  }

  async updateStatus(id: string, status: MatchStatus): Promise<Match> {
    const index = this.matches.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error(`Match with id ${id} not found`);
    }
    this.matches[index] = {
      ...this.matches[index],
      status,
      updatedAt: new Date(),
    };
    return this.matches[index];
  }

  async delete(id: string): Promise<void> {
    const index = this.matches.findIndex((m) => m.id === id);
    if (index !== -1) {
      this.matches.splice(index, 1);
    }
  }
}
