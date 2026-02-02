import { describe, it, expect, beforeEach } from 'vitest';
import { MatchService } from './service';
import { MockLikeRepository, MockMatchRepository } from './repository.mock';
import { MockUserRepository, MockDevProfileRepository, MockCompanyProfileRepository } from '../user/repository.mock';
import { ValidationError, NotFoundError } from '../shared/errors';

describe('MatchService', () => {
  let service: MatchService;
  let likeRepo: MockLikeRepository;
  let matchRepo: MockMatchRepository;
  let userRepo: MockUserRepository;
  let devProfileRepo: MockDevProfileRepository;
  let companyProfileRepo: MockCompanyProfileRepository;

  let devUserId: string;
  let devProfileId: string;
  let companyUserId: string;
  let companyProfileId: string;

  beforeEach(async () => {
    likeRepo = new MockLikeRepository();
    matchRepo = new MockMatchRepository();
    userRepo = new MockUserRepository();
    devProfileRepo = new MockDevProfileRepository();
    companyProfileRepo = new MockCompanyProfileRepository();

    service = new MatchService(likeRepo, matchRepo, userRepo, devProfileRepo, companyProfileRepo);

    // Create test users and profiles
    const devUser = await userRepo.create({
      email: 'dev@example.com',
      name: 'John Developer',
      type: 'DEV',
    });
    devUserId = devUser.id;

    const devProfile = await devProfileRepo.create(devUserId, {
      title: 'Full Stack Developer',
      skills: ['React', 'Node.js'],
    });
    devProfileId = devProfile.id;

    const companyUser = await userRepo.create({
      email: 'hr@techcorp.com',
      name: 'HR Manager',
      type: 'COMPANY',
    });
    companyUserId = companyUser.id;

    const companyProfile = await companyProfileRepo.create(companyUserId, {
      name: 'TechCorp',
      industry: 'Technology',
    });
    companyProfileId = companyProfile.id;
  });

  describe('like', () => {
    it('should create a like from dev to company', async () => {
      const like = await service.like(devUserId, companyUserId);

      expect(like.fromDevId).toBe(devProfileId);
      expect(like.toCompanyId).toBe(companyProfileId);
      expect(like.type).toBe('dev_to_company');
    });

    it('should create a like from company to dev', async () => {
      const like = await service.like(companyUserId, devUserId);

      expect(like.fromCompanyId).toBe(companyProfileId);
      expect(like.toDevId).toBe(devProfileId);
      expect(like.type).toBe('company_to_dev');
    });

    it('should throw NotFoundError for non-existent from user', async () => {
      await expect(service.like('non-existent', companyUserId)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError for non-existent to user', async () => {
      await expect(service.like(devUserId, 'non-existent')).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError when dev likes another dev', async () => {
      const anotherDev = await userRepo.create({
        email: 'dev2@example.com',
        name: 'Jane Developer',
        type: 'DEV',
      });

      await expect(service.like(devUserId, anotherDev.id)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when company likes another company', async () => {
      const anotherCompany = await userRepo.create({
        email: 'hr2@othercorp.com',
        name: 'HR Lead',
        type: 'COMPANY',
      });

      await expect(service.like(companyUserId, anotherCompany.id)).rejects.toThrow(ValidationError);
    });

    it('should not create duplicate like', async () => {
      await service.like(devUserId, companyUserId);
      const duplicateLike = await service.like(devUserId, companyUserId);

      expect(likeRepo.likes.length).toBe(1);
      expect(duplicateLike.fromDevId).toBe(devProfileId);
    });
  });

  describe('checkMatch', () => {
    it('should create match when both parties like each other', async () => {
      await service.like(devUserId, companyUserId);
      await service.like(companyUserId, devUserId);

      const match = await service.checkMatch(devProfileId, companyProfileId);

      expect(match).not.toBeNull();
      expect(match?.devId).toBe(devProfileId);
      expect(match?.companyId).toBe(companyProfileId);
      expect(match?.status).toBe('active');
    });

    it('should return null if only one party liked', async () => {
      await service.like(devUserId, companyUserId);

      const match = await service.checkMatch(devProfileId, companyProfileId);

      expect(match).toBeNull();
    });

    it('should return existing match if already matched', async () => {
      await service.like(devUserId, companyUserId);
      await service.like(companyUserId, devUserId);

      const match1 = await service.checkMatch(devProfileId, companyProfileId);
      const match2 = await service.checkMatch(devProfileId, companyProfileId);

      expect(match1?.id).toBe(match2?.id);
      expect(matchRepo.matches.length).toBe(1);
    });
  });

  describe('getMatches', () => {
    it('should return all matches for a dev', async () => {
      // Create another company
      const companyUser2 = await userRepo.create({
        email: 'hr2@anothercorp.com',
        name: 'HR Director',
        type: 'COMPANY',
      });
      const companyProfile2 = await companyProfileRepo.create(companyUser2.id, {
        name: 'AnotherCorp',
      });

      // Create mutual likes and matches
      await service.like(devUserId, companyUserId);
      await service.like(companyUserId, devUserId);
      await service.checkMatch(devProfileId, companyProfileId);

      await service.like(devUserId, companyUser2.id);
      await service.like(companyUser2.id, devUserId);
      await service.checkMatch(devProfileId, companyProfile2.id);

      const matches = await service.getMatches(devUserId);

      expect(matches.length).toBe(2);
    });

    it('should return all matches for a company', async () => {
      // Create another dev
      const devUser2 = await userRepo.create({
        email: 'dev2@example.com',
        name: 'Jane Developer',
        type: 'DEV',
      });
      const devProfile2 = await devProfileRepo.create(devUser2.id, {
        title: 'Backend Developer',
        skills: ['Python'],
      });

      // Create mutual likes and matches
      await service.like(devUserId, companyUserId);
      await service.like(companyUserId, devUserId);
      await service.checkMatch(devProfileId, companyProfileId);

      await service.like(devUser2.id, companyUserId);
      await service.like(companyUserId, devUser2.id);
      await service.checkMatch(devProfile2.id, companyProfileId);

      const matches = await service.getMatches(companyUserId);

      expect(matches.length).toBe(2);
    });

    it('should return empty array for user with no matches', async () => {
      const matches = await service.getMatches(devUserId);
      expect(matches).toEqual([]);
    });

    it('should throw NotFoundError for non-existent user', async () => {
      await expect(service.getMatches('non-existent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('closeMatch', () => {
    it('should close an active match', async () => {
      await service.like(devUserId, companyUserId);
      await service.like(companyUserId, devUserId);
      const match = await service.checkMatch(devProfileId, companyProfileId);

      const closedMatch = await service.closeMatch(match!.id);

      expect(closedMatch.status).toBe('closed');
    });

    it('should throw NotFoundError for non-existent match', async () => {
      await expect(service.closeMatch('non-existent')).rejects.toThrow(NotFoundError);
    });
  });
});
