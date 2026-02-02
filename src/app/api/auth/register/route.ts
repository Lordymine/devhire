import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

const registerDevSchema = z.object({
  type: z.literal('DEV'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional().default([]),
  experience: z.string().optional(),
  portfolio: z.string().url().optional(),
  github: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  location: z.string().optional(),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  currency: z.string().optional().default('BRL'),
});

const registerCompanySchema = z.object({
  type: z.literal('COMPANY'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
  companyName: z.string().min(1, 'Company name is required'),
  description: z.string().optional(),
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
  size: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
});

const registerSchema = z.discriminatedUnion('type', [
  registerDevSchema,
  registerCompanySchema,
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);

    if (validated.type === 'DEV') {
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: validated.email,
            name: validated.name,
            password: hashedPassword,
            type: 'DEV',
          },
        });

        const profile = await tx.devProfile.create({
          data: {
            userId: user.id,
            title: validated.title,
            bio: validated.bio,
            skills: validated.skills,
            experience: validated.experience,
            portfolio: validated.portfolio,
            github: validated.github,
            linkedin: validated.linkedin,
            location: validated.location,
            salaryMin: validated.salaryMin,
            salaryMax: validated.salaryMax,
            currency: validated.currency,
          },
        });

        return {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            type: user.type,
            createdAt: user.createdAt,
          },
          profile: {
            id: profile.id,
            title: profile.title,
            bio: profile.bio,
            skills: profile.skills,
            experience: profile.experience,
            portfolio: profile.portfolio,
            github: profile.github,
            linkedin: profile.linkedin,
            location: profile.location,
            salaryMin: profile.salaryMin,
            salaryMax: profile.salaryMax,
            currency: profile.currency,
          },
        };
      });

      return NextResponse.json(result, { status: 201 });
    } else {
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: validated.email,
            name: validated.name,
            password: hashedPassword,
            type: 'COMPANY',
          },
        });

        const profile = await tx.companyProfile.create({
          data: {
            userId: user.id,
            name: validated.companyName,
            description: validated.description,
            website: validated.website,
            logo: validated.logo,
            size: validated.size,
            industry: validated.industry,
            location: validated.location,
          },
        });

        return {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            type: user.type,
            createdAt: user.createdAt,
          },
          profile: {
            id: profile.id,
            name: profile.name,
            description: profile.description,
            website: profile.website,
            logo: profile.logo,
            size: profile.size,
            industry: profile.industry,
            location: profile.location,
          },
        };
      });

      return NextResponse.json(result, { status: 201 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
