import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeUser, jsonResponse } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  const assessments = await prisma.assessment.findMany({
    include: {
      questions: true,
      results: {
        where: { userId: auth.user.userId },
        orderBy: { completedAt: 'desc' },
        take: 1,
      }
    }
  });

  return jsonResponse({ assessments });
}
