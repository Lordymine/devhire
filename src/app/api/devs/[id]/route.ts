import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

const updateDevProfileSchema = z.object({
  title: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  portfolio: z.string().url().optional().nullable(),
  github: z.string().url().optional().nullable(),
  linkedin: z.string().url().optional().nullable(),
  location: z.string().optional().nullable(),
  salaryMin: z.number().positive().optional().nullable(),
  salaryMax: z.number().positive().optional().nullable(),
  currency: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const devProfile = await prisma.devProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!devProfile) {
      return NextResponse.json({ error: 'Dev profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      dev: {
        id: devProfile.id,
        userId: devProfile.userId,
        title: devProfile.title,
        bio: devProfile.bio,
        skills: devProfile.skills,
        experience: devProfile.experience,
        portfolio: devProfile.portfolio,
        github: devProfile.github,
        linkedin: devProfile.linkedin,
        location: devProfile.location,
        salaryMin: devProfile.salaryMin,
        salaryMax: devProfile.salaryMax,
        currency: devProfile.currency,
        user: devProfile.user,
      },
    });
  } catch (error) {
    console.error('Error fetching dev:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const devProfile = await prisma.devProfile.findUnique({
      where: { id },
    });

    if (!devProfile) {
      return NextResponse.json({ error: 'Dev profile not found' }, { status: 404 });
    }

    if (devProfile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validated = updateDevProfileSchema.parse(body);

    const updatedProfile = await prisma.devProfile.update({
      where: { id },
      data: validated,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      dev: {
        id: updatedProfile.id,
        userId: updatedProfile.userId,
        title: updatedProfile.title,
        bio: updatedProfile.bio,
        skills: updatedProfile.skills,
        experience: updatedProfile.experience,
        portfolio: updatedProfile.portfolio,
        github: updatedProfile.github,
        linkedin: updatedProfile.linkedin,
        location: updatedProfile.location,
        salaryMin: updatedProfile.salaryMin,
        salaryMax: updatedProfile.salaryMax,
        currency: updatedProfile.currency,
        user: updatedProfile.user,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Error updating dev:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
