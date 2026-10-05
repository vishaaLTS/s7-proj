import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonResponse } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const roles = await prisma.jobRole.findMany({
    orderBy: { title: 'asc' }
  });

  return jsonResponse({ roles });
}
