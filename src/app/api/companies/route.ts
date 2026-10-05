import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonResponse } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const companies = await prisma.company.findMany({
    orderBy: { name: 'asc' },
    include: {
      companyJobRoles: {
        include: { jobRole: true }
      }
    }
  });

  return jsonResponse({ companies });
}
