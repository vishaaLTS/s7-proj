import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonResponse } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const jobs = await prisma.job.findMany({
    where: { status: 'ACTIVE' },
    include: { company: true },
    orderBy: { createdAt: 'desc' },
  });

  return jsonResponse({ jobs });
}
