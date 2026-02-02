import { describe, it, expect, beforeEach } from 'vitest';
import { JobService } from './service';
import { MockJobRepository } from './repository.mock';
import { MockCompanyProfileRepository } from '../user/repository.mock';
import { ValidationError, NotFoundError, UnauthorizedError } from '../shared/errors';

describe('JobService', () => {
  let service: JobService;
  let jobRepo: MockJobRepository;
  let companyProfileRepo: MockCompanyProfileRepository;
  let companyId: string;

  beforeEach(async () => {
    jobRepo = new MockJobRepository();
    companyProfileRepo = new MockCompanyProfileRepository();

    service = new JobService(jobRepo, companyProfileRepo);

    // Create a test company profile
    const profile = await companyProfileRepo.create('user-1', {
      name: 'TechCorp',
      industry: 'Technology',
    });
    companyId = profile.id;
  });

  describe('create', () => {
    it('should create a job with valid data', async () => {
      const job = await service.create(companyId, {
        title: 'Senior Developer',
        description: 'We are looking for a senior developer',
        type: 'CLT',
        skills: ['React', 'Node.js'],
      });

      expect(job.title).toBe('Senior Developer');
      expect(job.companyId).toBe(companyId);
      expect(job.status).toBe('active');
      expect(job.skills).toEqual(['React', 'Node.js']);
    });

    it('should set default values', async () => {
      const job = await service.create(companyId, {
        title: 'Developer',
        description: 'Job description',
        type: 'PJ',
      });

      expect(job.remote).toBe(false);
      expect(job.currency).toBe('BRL');
      expect(job.requirements).toEqual([]);
      expect(job.skills).toEqual([]);
    });

    it('should throw ValidationError for missing title', async () => {
      await expect(
        service.create(companyId, {
          title: '',
          description: 'Job description',
          type: 'CLT',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for missing description', async () => {
      await expect(
        service.create(companyId, {
          title: 'Developer',
          description: '',
          type: 'CLT',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when salaryMin > salaryMax', async () => {
      await expect(
        service.create(companyId, {
          title: 'Developer',
          description: 'Job description',
          type: 'CLT',
          salaryMin: 10000,
          salaryMax: 5000,
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError for non-existent company', async () => {
      await expect(
        service.create('non-existent', {
          title: 'Developer',
          description: 'Job description',
          type: 'CLT',
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('should create remote job correctly', async () => {
      const job = await service.create(companyId, {
        title: 'Remote Developer',
        description: 'Work from anywhere',
        type: 'PJ',
        remote: true,
      });

      expect(job.remote).toBe(true);
    });

    it('should create freelance job', async () => {
      const job = await service.create(companyId, {
        title: 'Freelance Designer',
        description: 'Short-term project',
        type: 'Freelance',
      });

      expect(job.type).toBe('Freelance');
    });
  });

  describe('update', () => {
    let jobId: string;

    beforeEach(async () => {
      const job = await service.create(companyId, {
        title: 'Developer',
        description: 'Initial description',
        type: 'CLT',
      });
      jobId = job.id;
    });

    it('should update job title', async () => {
      const updated = await service.update(jobId, { title: 'Senior Developer' });
      expect(updated.title).toBe('Senior Developer');
    });

    it('should update job status', async () => {
      const updated = await service.update(jobId, { status: 'paused' });
      expect(updated.status).toBe('paused');
    });

    it('should update multiple fields', async () => {
      const updated = await service.update(jobId, {
        title: 'Lead Developer',
        description: 'Updated description',
        salaryMin: 8000,
        salaryMax: 12000,
      });

      expect(updated.title).toBe('Lead Developer');
      expect(updated.description).toBe('Updated description');
      expect(updated.salaryMin).toBe(8000);
      expect(updated.salaryMax).toBe(12000);
    });

    it('should throw NotFoundError for non-existent job', async () => {
      await expect(service.update('non-existent', { title: 'New Title' })).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw ValidationError when salaryMin > salaryMax', async () => {
      await expect(
        service.update(jobId, { salaryMin: 10000, salaryMax: 5000 })
      ).rejects.toThrow(ValidationError);
    });

    it('should close a job', async () => {
      const closed = await service.update(jobId, { status: 'closed' });
      expect(closed.status).toBe('closed');
    });
  });

  describe('listByCompany', () => {
    beforeEach(async () => {
      await service.create(companyId, {
        title: 'Job 1',
        description: 'Description 1',
        type: 'CLT',
      });
      await service.create(companyId, {
        title: 'Job 2',
        description: 'Description 2',
        type: 'PJ',
      });
    });

    it('should list all jobs for a company', async () => {
      const jobs = await service.listByCompany(companyId);
      expect(jobs.length).toBe(2);
    });

    it('should return empty array for company with no jobs', async () => {
      const anotherCompany = await companyProfileRepo.create('user-2', {
        name: 'OtherCorp',
      });
      const jobs = await service.listByCompany(anotherCompany.id);
      expect(jobs).toEqual([]);
    });
  });

  describe('listActive', () => {
    beforeEach(async () => {
      const job1 = await service.create(companyId, {
        title: 'Active Job 1',
        description: 'Description 1',
        type: 'CLT',
      });
      const job2 = await service.create(companyId, {
        title: 'Active Job 2',
        description: 'Description 2',
        type: 'PJ',
      });
      await service.create(companyId, {
        title: 'Job to be paused',
        description: 'Description 3',
        type: 'Freelance',
      });

      // Pause the third job
      const pausedJob = jobRepo.jobs[2];
      await service.update(pausedJob.id, { status: 'paused' });
    });

    it('should only list active jobs', async () => {
      const jobs = await service.listActive();
      expect(jobs.length).toBe(2);
      jobs.forEach((job) => {
        expect(job.status).toBe('active');
      });
    });

    it('should not include paused or closed jobs', async () => {
      const jobs = await service.listActive();
      const titles = jobs.map((j) => j.title);
      expect(titles).not.toContain('Job to be paused');
    });
  });

  describe('getById', () => {
    it('should return job by id', async () => {
      const created = await service.create(companyId, {
        title: 'Test Job',
        description: 'Test description',
        type: 'CLT',
      });

      const job = await service.getById(created.id);
      expect(job).not.toBeNull();
      expect(job?.title).toBe('Test Job');
    });

    it('should return null for non-existent job', async () => {
      const job = await service.getById('non-existent');
      expect(job).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a job', async () => {
      const job = await service.create(companyId, {
        title: 'Job to delete',
        description: 'Will be deleted',
        type: 'CLT',
      });

      await service.delete(job.id);

      const found = await service.getById(job.id);
      expect(found).toBeNull();
    });

    it('should throw NotFoundError for non-existent job', async () => {
      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundError);
    });
  });
});
