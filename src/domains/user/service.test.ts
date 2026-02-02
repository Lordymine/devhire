import { describe, it, expect, beforeEach } from 'vitest';
import { UserService } from './service';
import { MockUserRepository, MockDevProfileRepository, MockCompanyProfileRepository } from './repository.mock';
import { ValidationError, ConflictError, NotFoundError } from '../shared/errors';

describe('UserService', () => {
  let service: UserService;
  let userRepo: MockUserRepository;
  let devProfileRepo: MockDevProfileRepository;
  let companyProfileRepo: MockCompanyProfileRepository;

  beforeEach(() => {
    userRepo = new MockUserRepository();
    devProfileRepo = new MockDevProfileRepository();
    companyProfileRepo = new MockCompanyProfileRepository();
    service = new UserService(userRepo, devProfileRepo, companyProfileRepo);
  });

  describe('registerDev', () => {
    it('should register a dev with profile', async () => {
      const result = await service.registerDev({
        email: 'dev@example.com',
        name: 'John Doe',
        title: 'Full Stack Developer',
        skills: ['React', 'Node.js'],
      });

      expect(result.email).toBe('dev@example.com');
      expect(result.type).toBe('DEV');
      expect(result.name).toBe('John Doe');
    });

    it('should create dev profile with default currency', async () => {
      await service.registerDev({
        email: 'dev@example.com',
        name: 'John Doe',
        title: 'Backend Developer',
        skills: ['Python'],
      });

      const profile = await devProfileRepo.findByUserId(userRepo.users[0].id);
      expect(profile?.currency).toBe('BRL');
    });

    it('should throw ValidationError for invalid email', async () => {
      await expect(
        service.registerDev({
          email: 'invalid-email',
          name: 'John Doe',
          title: 'Developer',
          skills: [],
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ConflictError if email already exists', async () => {
      await service.registerDev({
        email: 'dev@example.com',
        name: 'John Doe',
        title: 'Developer',
        skills: [],
      });

      await expect(
        service.registerDev({
          email: 'dev@example.com',
          name: 'Jane Doe',
          title: 'Developer',
          skills: [],
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should store skills correctly', async () => {
      const skills = ['React', 'TypeScript', 'Node.js', 'PostgreSQL'];
      await service.registerDev({
        email: 'dev@example.com',
        name: 'John Doe',
        title: 'Full Stack Developer',
        skills,
      });

      const profile = await devProfileRepo.findByUserId(userRepo.users[0].id);
      expect(profile?.skills).toEqual(skills);
    });

    it('should store salary expectations', async () => {
      await service.registerDev({
        email: 'dev@example.com',
        name: 'John Doe',
        title: 'Senior Developer',
        skills: ['Go'],
        salaryMin: 10000,
        salaryMax: 15000,
        currency: 'USD',
      });

      const profile = await devProfileRepo.findByUserId(userRepo.users[0].id);
      expect(profile?.salaryMin).toBe(10000);
      expect(profile?.salaryMax).toBe(15000);
      expect(profile?.currency).toBe('USD');
    });
  });

  describe('registerCompany', () => {
    it('should register a company with profile', async () => {
      const result = await service.registerCompany({
        email: 'hr@techcorp.com',
        name: 'HR Manager',
        companyName: 'TechCorp',
        description: 'A tech company',
        industry: 'Technology',
      });

      expect(result.email).toBe('hr@techcorp.com');
      expect(result.type).toBe('COMPANY');
    });

    it('should throw ValidationError for invalid email', async () => {
      await expect(
        service.registerCompany({
          email: 'invalid-email',
          companyName: 'TechCorp',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for missing company name', async () => {
      await expect(
        service.registerCompany({
          email: 'hr@techcorp.com',
          companyName: '',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ConflictError if email already exists', async () => {
      await service.registerCompany({
        email: 'hr@techcorp.com',
        companyName: 'TechCorp',
      });

      await expect(
        service.registerCompany({
          email: 'hr@techcorp.com',
          companyName: 'OtherCorp',
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should store company profile details', async () => {
      await service.registerCompany({
        email: 'hr@techcorp.com',
        companyName: 'TechCorp',
        description: 'Leading tech company',
        website: 'https://techcorp.com',
        size: '100-500',
        industry: 'Technology',
        location: 'San Francisco, CA',
      });

      const profile = await companyProfileRepo.findByUserId(userRepo.users[0].id);
      expect(profile?.name).toBe('TechCorp');
      expect(profile?.description).toBe('Leading tech company');
      expect(profile?.website).toBe('https://techcorp.com');
      expect(profile?.size).toBe('100-500');
      expect(profile?.industry).toBe('Technology');
      expect(profile?.location).toBe('San Francisco, CA');
    });
  });

  describe('getProfile', () => {
    it('should return dev profile for DEV user', async () => {
      const user = await service.registerDev({
        email: 'dev@example.com',
        name: 'John Doe',
        title: 'Full Stack Developer',
        skills: ['React', 'Node.js'],
      });

      const profile = await service.getProfile(user.id);
      expect(profile).not.toBeNull();
      expect(profile?.userId).toBe(user.id);
      expect('title' in profile!).toBe(true);
    });

    it('should return company profile for COMPANY user', async () => {
      const user = await service.registerCompany({
        email: 'hr@techcorp.com',
        companyName: 'TechCorp',
      });

      const profile = await service.getProfile(user.id);
      expect(profile).not.toBeNull();
      expect(profile?.userId).toBe(user.id);
      expect('name' in profile!).toBe(true);
    });

    it('should return null for non-existent user', async () => {
      const profile = await service.getProfile('non-existent-id');
      expect(profile).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const createdUser = await service.registerDev({
        email: 'dev@example.com',
        name: 'John Doe',
        title: 'Developer',
        skills: [],
      });

      const user = await service.getUserById(createdUser.id);
      expect(user).not.toBeNull();
      expect(user?.email).toBe('dev@example.com');
    });

    it('should return null for non-existent user', async () => {
      const user = await service.getUserById('non-existent-id');
      expect(user).toBeNull();
    });
  });
});
