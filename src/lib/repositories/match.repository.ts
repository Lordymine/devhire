import { PrismaClient } from '@prisma/client';
import type {
  LikeRepository,
  MatchRepository,
  Like,
  Match,
  CreateLikeDto,
  CreateMatchDto,
  MatchStatus,
} from '@/domains/match';

export class PrismaLikeRepository implements LikeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Like | null> {
    const like = await this.prisma.like.findUnique({ where: { id } });
    if (!like) return null;
    return this.mapToLike(like);
  }

  async findByDevAndCompany(devId: string, companyId: string): Promise<Like | null> {
    const like = await this.prisma.like.findFirst({
      where: {
        fromDevId: devId,
        toCompanyId: companyId,
        type: 'dev_to_company',
      },
    });
    if (!like) return null;
    return this.mapToLike(like);
  }

  async findByCompanyAndDev(companyId: string, devId: string): Promise<Like | null> {
    const like = await this.prisma.like.findFirst({
      where: {
        fromCompanyId: companyId,
        toDevId: devId,
        type: 'company_to_dev',
      },
    });
    if (!like) return null;
    return this.mapToLike(like);
  }

  async findByFromUser(userId: string, type: 'DEV' | 'COMPANY'): Promise<Like[]> {
    const where = type === 'DEV'
      ? { fromDevId: userId }
      : { fromCompanyId: userId };

    const likes = await this.prisma.like.findMany({ where });
    return likes.map(this.mapToLike);
  }

  async create(dto: CreateLikeDto): Promise<Like> {
    const like = await this.prisma.like.create({
      data: {
        fromDevId: dto.fromDevId,
        fromCompanyId: dto.fromCompanyId,
        toDevId: dto.toDevId,
        toCompanyId: dto.toCompanyId,
        type: dto.type,
      },
    });
    return this.mapToLike(like);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.like.delete({ where: { id } });
  }

  private mapToLike(like: {
    id: string;
    fromDevId: string | null;
    fromCompanyId: string | null;
    toDevId: string | null;
    toCompanyId: string | null;
    type: string;
    createdAt: Date;
  }): Like {
    return {
      id: like.id,
      fromDevId: like.fromDevId,
      fromCompanyId: like.fromCompanyId,
      toDevId: like.toDevId,
      toCompanyId: like.toCompanyId,
      type: like.type as Like['type'],
      createdAt: like.createdAt,
    };
  }
}

export class PrismaMatchRepository implements MatchRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Match | null> {
    const match = await this.prisma.match.findUnique({ where: { id } });
    if (!match) return null;
    return this.mapToMatch(match);
  }

  async findByDevAndCompany(devId: string, companyId: string): Promise<Match | null> {
    const match = await this.prisma.match.findFirst({
      where: { devId, companyId },
    });
    if (!match) return null;
    return this.mapToMatch(match);
  }

  async findByDevId(devId: string): Promise<Match[]> {
    const matches = await this.prisma.match.findMany({
      where: { devId },
      orderBy: { createdAt: 'desc' },
    });
    return matches.map(this.mapToMatch);
  }

  async findByCompanyId(companyId: string): Promise<Match[]> {
    const matches = await this.prisma.match.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
    return matches.map(this.mapToMatch);
  }

  async findByDevIdWithCompany(devId: string): Promise<(Match & { company: { id: string; name: string; logo: string | null; userId: string } })[]> {
    const matches = await this.prisma.match.findMany({
      where: { devId },
      include: {
        company: {
          select: { id: true, name: true, logo: true, userId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return matches.map((match) => ({
      ...this.mapToMatch(match),
      company: match.company,
    }));
  }

  async findByCompanyIdWithDev(companyId: string): Promise<(Match & { dev: { id: string; title: string | null; userId: string; user: { name: string | null; image: string | null } } })[]> {
    const matches = await this.prisma.match.findMany({
      where: { companyId },
      include: {
        dev: {
          select: {
            id: true,
            title: true,
            userId: true,
            user: { select: { name: true, image: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return matches.map((match) => ({
      ...this.mapToMatch(match),
      dev: match.dev,
    }));
  }

  async create(dto: CreateMatchDto): Promise<Match> {
    const match = await this.prisma.match.create({
      data: {
        devId: dto.devId,
        companyId: dto.companyId,
        status: 'active',
      },
    });
    return this.mapToMatch(match);
  }

  async updateStatus(id: string, status: MatchStatus): Promise<Match> {
    const match = await this.prisma.match.update({
      where: { id },
      data: { status },
    });
    return this.mapToMatch(match);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.match.delete({ where: { id } });
  }

  private mapToMatch(match: {
    id: string;
    devId: string;
    companyId: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): Match {
    return {
      id: match.id,
      devId: match.devId,
      companyId: match.companyId,
      status: match.status as Match['status'],
      createdAt: match.createdAt,
      updatedAt: match.updatedAt,
    };
  }
}
