import type {
  User,
  CreateUserDto,
  DevProfile,
  CompanyProfile,
  CreateDevProfileDto,
  CreateCompanyProfileDto,
} from './types';
import type {
  UserRepository,
  DevProfileRepository,
  CompanyProfileRepository,
} from './repository';

export class MockUserRepository implements UserRepository {
  users: User[] = [];
  private idCounter = 1;

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const user: User = {
      id: `user-${this.idCounter++}`,
      email: dto.email,
      name: dto.name ?? null,
      image: dto.image ?? null,
      type: dto.type,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async update(id: string, data: Partial<CreateUserDto>): Promise<User> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error(`User with id ${id} not found`);
    }
    this.users[index] = {
      ...this.users[index],
      ...data,
      updatedAt: new Date(),
    };
    return this.users[index];
  }

  async delete(id: string): Promise<void> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }
}

export class MockDevProfileRepository implements DevProfileRepository {
  profiles: DevProfile[] = [];
  private idCounter = 1;

  async findByUserId(userId: string): Promise<DevProfile | null> {
    return this.profiles.find((p) => p.userId === userId) ?? null;
  }

  async create(userId: string, dto: CreateDevProfileDto): Promise<DevProfile> {
    const profile: DevProfile = {
      id: `dev-profile-${this.idCounter++}`,
      userId,
      title: dto.title ?? null,
      bio: dto.bio ?? null,
      skills: dto.skills ?? [],
      experience: dto.experience ?? null,
      portfolio: dto.portfolio ?? null,
      github: dto.github ?? null,
      linkedin: dto.linkedin ?? null,
      location: dto.location ?? null,
      salaryMin: dto.salaryMin ?? null,
      salaryMax: dto.salaryMax ?? null,
      currency: dto.currency ?? 'BRL',
    };
    this.profiles.push(profile);
    return profile;
  }

  async update(userId: string, data: Partial<CreateDevProfileDto>): Promise<DevProfile> {
    const index = this.profiles.findIndex((p) => p.userId === userId);
    if (index === -1) {
      throw new Error(`DevProfile for user ${userId} not found`);
    }
    this.profiles[index] = {
      ...this.profiles[index],
      ...data,
    };
    return this.profiles[index];
  }

  async delete(userId: string): Promise<void> {
    const index = this.profiles.findIndex((p) => p.userId === userId);
    if (index !== -1) {
      this.profiles.splice(index, 1);
    }
  }
}

export class MockCompanyProfileRepository implements CompanyProfileRepository {
  profiles: CompanyProfile[] = [];
  private idCounter = 1;

  async findByUserId(userId: string): Promise<CompanyProfile | null> {
    return this.profiles.find((p) => p.userId === userId) ?? null;
  }

  async create(userId: string, dto: CreateCompanyProfileDto): Promise<CompanyProfile> {
    const profile: CompanyProfile = {
      id: `company-profile-${this.idCounter++}`,
      userId,
      name: dto.name,
      description: dto.description ?? null,
      website: dto.website ?? null,
      logo: dto.logo ?? null,
      size: dto.size ?? null,
      industry: dto.industry ?? null,
      location: dto.location ?? null,
    };
    this.profiles.push(profile);
    return profile;
  }

  async update(userId: string, data: Partial<CreateCompanyProfileDto>): Promise<CompanyProfile> {
    const index = this.profiles.findIndex((p) => p.userId === userId);
    if (index === -1) {
      throw new Error(`CompanyProfile for user ${userId} not found`);
    }
    this.profiles[index] = {
      ...this.profiles[index],
      ...data,
    };
    return this.profiles[index];
  }

  async delete(userId: string): Promise<void> {
    const index = this.profiles.findIndex((p) => p.userId === userId);
    if (index !== -1) {
      this.profiles.splice(index, 1);
    }
  }
}
