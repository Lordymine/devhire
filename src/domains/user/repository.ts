import type {
  User,
  CreateUserDto,
  DevProfile,
  CompanyProfile,
  CreateDevProfileDto,
  CreateCompanyProfileDto,
} from './types';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(dto: CreateUserDto): Promise<User>;
  update(id: string, data: Partial<CreateUserDto>): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface DevProfileRepository {
  findByUserId(userId: string): Promise<DevProfile | null>;
  create(userId: string, dto: CreateDevProfileDto): Promise<DevProfile>;
  update(userId: string, data: Partial<CreateDevProfileDto>): Promise<DevProfile>;
  delete(userId: string): Promise<void>;
}

export interface CompanyProfileRepository {
  findByUserId(userId: string): Promise<CompanyProfile | null>;
  create(userId: string, dto: CreateCompanyProfileDto): Promise<CompanyProfile>;
  update(userId: string, data: Partial<CreateCompanyProfileDto>): Promise<CompanyProfile>;
  delete(userId: string): Promise<void>;
}
