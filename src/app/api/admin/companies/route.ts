import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CreateCompanySchema = z.object({
  name: z.string().min(1),
  industry: z.string().min(1),
  tier: z.string().default('TIER_1'),
  website: z.string().url().optional().or(z.literal('')),
});

export async function GET(req: NextRequest) {
  const auth = await authorizeUser(['ADMIN']);
  if ('error' in auth) return auth.error;

  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' }
    });

    return jsonResponse({ companies });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to fetch companies', 'SERVER_ERROR', 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await authorizeUser(['ADMIN']);
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const parsed = CreateCompanySchema.parse(body);

    const company = await prisma.company.create({
      data: {
        name: parsed.name,
        industry: parsed.industry,
        tier: parsed.tier,
        website: parsed.website || null,
      }
    });

    return jsonResponse({ company }, 201);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return errorResponse(err.errors[0].message, 'VALIDATION_ERROR', 400);
    }
    return errorResponse(err.message || 'Failed to create company', 'SERVER_ERROR', 500);
  }
}
