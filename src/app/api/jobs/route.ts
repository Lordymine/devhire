import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

const createJobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  requirements: z.array(z.string()).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
  location: z.string().optional(),
  remote: z.boolean().optional().default(false),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  currency: z.string().optional().default('BRL'),
  type: z.enum(['CLT', 'PJ', 'Freelance']),
}).refine(
  (data) => {
    if (data.salaryMin !== undefined && data.salaryMax !== undefined) {
      return data.salaryMin <= data.salaryMax;
    }
    return true;
  },
  { message: 'salaryMin must be less than or equal to salaryMax', path: ['salaryMin'] }
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const skills = searchParams.get('skills')?.split(',').filter(Boolean);
    const remote = searchParams.get('remote');
    const location = searchParams.get('location');
    const salaryMin = searchParams.get('salaryMin');
    const salaryMax = searchParams.get('salaryMax');

    const parseOptionalInt = (value: string | null) => {
      if (!value) return undefined;
      const parsed = Number.parseInt(value, 10);
      return Number.isNaN(parsed) ? undefined : parsed;
    };

    const where: Record<string, unknown> = { status: 'active' };

    if (skills && skills.length > 0) {
      where.skills = { hasSome: skills };
    }
    if (remote !== null) {
      where.remote = remote === 'true';
    }
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    const minValue = parseOptionalInt(salaryMin);
    const maxValue = parseOptionalInt(salaryMax);
    if (minValue !== undefined) {
      where.salaryMax = { gte: minValue };
    }
    if (maxValue !== undefined) {
      where.salaryMin = { lte: maxValue };
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            location: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      jobs: jobs.map((job) => ({
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        skills: job.skills,
        location: job.location,
        remote: job.remote,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        currency: job.currency,
        type: job.type,
        status: job.status,
        createdAt: job.createdAt,
        company: job.company,
      })),
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.type !== 'COMPANY') {
      return NextResponse.json(
        { error: 'Only companies can create jobs' },
        { status: 403 }
      );
    }

    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!companyProfile) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const validated = createJobSchema.parse(body);

    const job = await prisma.job.create({
      data: {
        companyId: companyProfile.id,
        title: validated.title,
        description: validated.description,
        requirements: validated.requirements,
        skills: validated.skills,
        location: validated.location,
        remote: validated.remote,
        salaryMin: validated.salaryMin,
        salaryMax: validated.salaryMax,
        currency: validated.currency,
        type: validated.type,
        status: 'active',
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        job: {
          id: job.id,
          title: job.title,
          description: job.description,
          requirements: job.requirements,
          skills: job.skills,
          location: job.location,
          remote: job.remote,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          currency: job.currency,
          type: job.type,
          status: job.status,
          createdAt: job.createdAt,
          company: job.company,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
