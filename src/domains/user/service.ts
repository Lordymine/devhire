import type {
  User,
  DevProfile,
  CompanyProfile,
  CreateDevProfileDto,
  CreateCompanyProfileDto,
} from './types';
import { createUserSchema, createDevProfileSchema, createCompanyProfileSchema } from './types';
import type {
  UserRepository,
  DevProfileRepository,
  CompanyProfileRepository,
} from './repository';
import { ValidationError, ConflictError } from '../shared/errors';

export interface RegisterDevDto {
  email: string;
  name?: string;
  image?: string;
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

export interface RegisterCompanyDto {
  email: string;
  name?: string;
  image?: string;
  companyName: string;
  description?: string;
  website?: string;
  logo?: string;
  size?: string;
  industry?: string;
  location?: string;
}

export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly devProfileRepo: DevProfileRepository,
    private readonly companyProfileRepo: CompanyProfileRepository
  ) {}

  async registerDev(dto: RegisterDevDto): Promise<User> {
    const userValidation = createUserSchema.safeParse({
      email: dto.email,
      name: dto.name,
      image: dto.image,
      type: 'DEV',
    });

    if (!userValidation.success) {
      const error = userValidation.error.issues[0];
      throw new ValidationError(error.message, error.path.join('.'));
    }

    const profileValidation = createDevProfileSchema.safeParse({
      title: dto.title,
      bio: dto.bio,
      skills: dto.skills,
      experience: dto.experience,
      portfolio: dto.portfolio,
      github: dto.github,
      linkedin: dto.linkedin,
      location: dto.location,
      salaryMin: dto.salaryMin,
      salaryMax: dto.salaryMax,
      currency: dto.currency,
    });

    if (!profileValidation.success) {
      const error = profileValidation.error.issues[0];
      throw new ValidationError(error.message, error.path.join('.'));
    }

    const existingUser = await this.userRepo.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictError(`User with email ${dto.email} already exists`);
    }

    const user = await this.userRepo.create({
      email: dto.email,
      name: dto.name,
      image: dto.image,
      type: 'DEV',
    });

    const profileData: CreateDevProfileDto = {
      title: dto.title,
      bio: dto.bio,
      skills: dto.skills ?? [],
      experience: dto.experience,
      portfolio: dto.portfolio,
      github: dto.github,
      linkedin: dto.linkedin,
      location: dto.location,
      salaryMin: dto.salaryMin,
      salaryMax: dto.salaryMax,
      currency: dto.currency ?? 'BRL',
    };

    await this.devProfileRepo.create(user.id, profileData);

    return user;
  }

  async registerCompany(dto: RegisterCompanyDto): Promise<User> {
    const userValidation = createUserSchema.safeParse({
      email: dto.email,
      name: dto.name,
      image: dto.image,
      type: 'COMPANY',
    });

    if (!userValidation.success) {
      const error = userValidation.error.issues[0];
      throw new ValidationError(error.message, error.path.join('.'));
    }

    const profileValidation = createCompanyProfileSchema.safeParse({
      name: dto.companyName,
      description: dto.description,
      website: dto.website,
      logo: dto.logo,
      size: dto.size,
      industry: dto.industry,
      location: dto.location,
    });

    if (!profileValidation.success) {
      const error = profileValidation.error.issues[0];
      throw new ValidationError(error.message, error.path.join('.'));
    }

    const existingUser = await this.userRepo.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictError(`User with email ${dto.email} already exists`);
    }

    const user = await this.userRepo.create({
      email: dto.email,
      name: dto.name,
      image: dto.image,
      type: 'COMPANY',
    });

    const profileData: CreateCompanyProfileDto = {
      name: dto.companyName,
      description: dto.description,
      website: dto.website,
      logo: dto.logo,
      size: dto.size,
      industry: dto.industry,
      location: dto.location,
    };

    await this.companyProfileRepo.create(user.id, profileData);

    return user;
  }

  async getProfile(userId: string): Promise<DevProfile | CompanyProfile | null> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      return null;
    }

    if (user.type === 'DEV') {
      return this.devProfileRepo.findByUserId(userId);
    } else {
      return this.companyProfileRepo.findByUserId(userId);
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.userRepo.findById(userId);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }
}
