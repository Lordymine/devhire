import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userType = session.user.type;

    if (userType === 'DEV') {
      const devProfile = await prisma.devProfile.findUnique({
        where: { userId },
      });

      if (!devProfile) {
        return NextResponse.json({ matches: [] });
      }

      const matches = await prisma.match.findMany({
        where: { devId: devProfile.id },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              description: true,
              website: true,
              industry: true,
              location: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        matches: matches.map((match) => ({
          id: match.id,
          status: match.status,
          createdAt: match.createdAt,
          company: match.company,
        })),
      });
    } else {
      const companyProfile = await prisma.companyProfile.findUnique({
        where: { userId },
      });

      if (!companyProfile) {
        return NextResponse.json({ matches: [] });
      }

      const matches = await prisma.match.findMany({
        where: { companyId: companyProfile.id },
        include: {
          dev: {
            select: {
              id: true,
              title: true,
              bio: true,
              skills: true,
              experience: true,
              location: true,
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        matches: matches.map((match) => ({
          id: match.id,
          status: match.status,
          createdAt: match.createdAt,
          dev: match.dev,
        })),
      });
    }
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
