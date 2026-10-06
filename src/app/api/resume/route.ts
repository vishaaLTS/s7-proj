import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeUser, jsonResponse } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  const resumes = await prisma.resume.findMany({
    where: { userId: auth.user.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      analysis: true,
      fileAsset: true,
    }
  });

  return jsonResponse({ resumes });
}
