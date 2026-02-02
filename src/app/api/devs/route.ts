import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const skills = searchParams.get('skills')?.split(',').filter(Boolean);
    const location = searchParams.get('location');
    const salaryMin = searchParams.get('salaryMin');
    const salaryMax = searchParams.get('salaryMax');

    const parseOptionalInt = (value: string | null) => {
      if (!value) return undefined;
      const parsed = Number.parseInt(value, 10);
      return Number.isNaN(parsed) ? undefined : parsed;
    };

    const where: Record<string, unknown> = {};

    if (skills && skills.length > 0) {
      where.skills = { hasSome: skills };
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

    const devProfiles = await prisma.devProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const devs = devProfiles.map((profile) => ({
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
      user: profile.user,
    }));

    return NextResponse.json({ devs });
  } catch (error) {
    console.error('Error fetching devs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
