import type { Like, Match } from './types';
import type { LikeRepository, MatchRepository } from './repository';
import type { UserRepository, DevProfileRepository, CompanyProfileRepository } from '../user/repository';
import { ValidationError, NotFoundError } from '../shared/errors';

export class MatchService {
  constructor(
    private readonly likeRepo: LikeRepository,
    private readonly matchRepo: MatchRepository,
    private readonly userRepo: UserRepository,
    private readonly devProfileRepo: DevProfileRepository,
    private readonly companyProfileRepo: CompanyProfileRepository
  ) {}

  async like(fromUserId: string, toUserId: string): Promise<Like> {
    const fromUser = await this.userRepo.findById(fromUserId);
    if (!fromUser) {
      throw new NotFoundError('User', fromUserId);
    }

    const toUser = await this.userRepo.findById(toUserId);
    if (!toUser) {
      throw new NotFoundError('User', toUserId);
    }

    // Validate that likes are cross-type (dev <-> company)
    if (fromUser.type === toUser.type) {
      throw new ValidationError(
        `Cannot like: both users are of type ${fromUser.type}. Likes must be between DEV and COMPANY.`
      );
    }

    if (fromUser.type === 'DEV') {
      const devProfile = await this.devProfileRepo.findByUserId(fromUserId);
      const companyProfile = await this.companyProfileRepo.findByUserId(toUserId);

      if (!devProfile) {
        throw new NotFoundError('DevProfile', fromUserId);
      }
      if (!companyProfile) {
        throw new NotFoundError('CompanyProfile', toUserId);
      }

      // Check for existing like
      const existingLike = await this.likeRepo.findByDevAndCompany(devProfile.id, companyProfile.id);
      if (existingLike) {
        return existingLike;
      }

      return this.likeRepo.create({
        fromDevId: devProfile.id,
        toCompanyId: companyProfile.id,
        type: 'dev_to_company',
      });
    } else {
      const companyProfile = await this.companyProfileRepo.findByUserId(fromUserId);
      const devProfile = await this.devProfileRepo.findByUserId(toUserId);

      if (!companyProfile) {
        throw new NotFoundError('CompanyProfile', fromUserId);
      }
      if (!devProfile) {
        throw new NotFoundError('DevProfile', toUserId);
      }

      // Check for existing like
      const existingLike = await this.likeRepo.findByCompanyAndDev(companyProfile.id, devProfile.id);
      if (existingLike) {
        return existingLike;
      }

      return this.likeRepo.create({
        fromCompanyId: companyProfile.id,
        toDevId: devProfile.id,
        type: 'company_to_dev',
      });
    }
  }

  async checkMatch(devId: string, companyId: string): Promise<Match | null> {
    // Check if match already exists
    const existingMatch = await this.matchRepo.findByDevAndCompany(devId, companyId);
    if (existingMatch) {
      return existingMatch;
    }

    // Check if both parties have liked each other
    const devLikedCompany = await this.likeRepo.findByDevAndCompany(devId, companyId);
    const companyLikedDev = await this.likeRepo.findByCompanyAndDev(companyId, devId);

    if (devLikedCompany && companyLikedDev) {
      // Create a match
      return this.matchRepo.create({
        devId,
        companyId,
      });
    }

    return null;
  }

  async getMatches(userId: string): Promise<Match[]> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
    }

    if (user.type === 'DEV') {
      const devProfile = await this.devProfileRepo.findByUserId(userId);
      if (!devProfile) {
        return [];
      }
      return this.matchRepo.findByDevId(devProfile.id);
    } else {
      const companyProfile = await this.companyProfileRepo.findByUserId(userId);
      if (!companyProfile) {
        return [];
      }
      return this.matchRepo.findByCompanyId(companyProfile.id);
    }
  }

  async closeMatch(matchId: string): Promise<Match> {
    const match = await this.matchRepo.findById(matchId);
    if (!match) {
      throw new NotFoundError('Match', matchId);
    }

    return this.matchRepo.updateStatus(matchId, 'closed');
  }
}
