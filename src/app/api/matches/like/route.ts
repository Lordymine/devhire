import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

const likeSchema = z.object({
  targetUserId: z.string().min(1, 'Target user ID is required'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = likeSchema.parse(body);

    const fromUserId = session.user.id;
    const fromUserType = session.user.type;
    const toUserId = validated.targetUserId;

    const toUser = await prisma.user.findUnique({
      where: { id: toUserId },
    });

    if (!toUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    if (fromUserType === toUser.type) {
      return NextResponse.json(
        { error: 'Cannot like: both users are of the same type. Likes must be between DEV and COMPANY.' },
        { status: 400 }
      );
    }

    let like;
    let match = null;

    if (fromUserType === 'DEV') {
      const devProfile = await prisma.devProfile.findUnique({
        where: { userId: fromUserId },
      });
      const companyProfile = await prisma.companyProfile.findUnique({
        where: { userId: toUserId },
      });

      if (!devProfile) {
        return NextResponse.json({ error: 'Dev profile not found' }, { status: 404 });
      }
      if (!companyProfile) {
        return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
      }

      const existingLike = await prisma.like.findFirst({
        where: {
          fromDevId: devProfile.id,
          toCompanyId: companyProfile.id,
          type: 'dev_to_company',
        },
      });

      if (existingLike) {
        like = existingLike;
      } else {
        like = await prisma.like.create({
          data: {
            fromDevId: devProfile.id,
            toCompanyId: companyProfile.id,
            type: 'dev_to_company',
          },
        });
      }

      const reciprocalLike = await prisma.like.findFirst({
        where: {
          fromCompanyId: companyProfile.id,
          toDevId: devProfile.id,
          type: 'company_to_dev',
        },
      });

      if (reciprocalLike) {
        const existingMatch = await prisma.match.findFirst({
          where: {
            devId: devProfile.id,
            companyId: companyProfile.id,
          },
        });

        if (!existingMatch) {
          match = await prisma.match.create({
            data: {
              devId: devProfile.id,
              companyId: companyProfile.id,
              status: 'active',
            },
          });
        } else {
          match = existingMatch;
        }
      }
    } else {
      const companyProfile = await prisma.companyProfile.findUnique({
        where: { userId: fromUserId },
      });
      const devProfile = await prisma.devProfile.findUnique({
        where: { userId: toUserId },
      });

      if (!companyProfile) {
        return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
      }
      if (!devProfile) {
        return NextResponse.json({ error: 'Dev profile not found' }, { status: 404 });
      }

      const existingLike = await prisma.like.findFirst({
        where: {
          fromCompanyId: companyProfile.id,
          toDevId: devProfile.id,
          type: 'company_to_dev',
        },
      });

      if (existingLike) {
        like = existingLike;
      } else {
        like = await prisma.like.create({
          data: {
            fromCompanyId: companyProfile.id,
            toDevId: devProfile.id,
            type: 'company_to_dev',
          },
        });
      }

      const reciprocalLike = await prisma.like.findFirst({
        where: {
          fromDevId: devProfile.id,
          toCompanyId: companyProfile.id,
          type: 'dev_to_company',
        },
      });

      if (reciprocalLike) {
        const existingMatch = await prisma.match.findFirst({
          where: {
            devId: devProfile.id,
            companyId: companyProfile.id,
          },
        });

        if (!existingMatch) {
          match = await prisma.match.create({
            data: {
              devId: devProfile.id,
              companyId: companyProfile.id,
              status: 'active',
            },
          });
        } else {
          match = existingMatch;
        }
      }
    }

    return NextResponse.json({ like, match }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Error creating like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
