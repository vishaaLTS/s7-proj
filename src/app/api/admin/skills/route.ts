import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CreateSkillSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await authorizeUser(['ADMIN']);
  if ('error' in auth) return auth.error;

  try {
    const skills = await prisma.skill.findMany({
      include: { aliases: true },
      orderBy: { name: 'asc' }
    });

    return jsonResponse({ skills });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to fetch skills', 'SERVER_ERROR', 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await authorizeUser(['ADMIN']);
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const parsed = CreateSkillSchema.parse(body);

    const skill = await prisma.skill.create({
      data: {
        name: parsed.name,
        category: parsed.category,
        description: parsed.description || null,
        aliases: {
          create: {
            alias: parsed.name.toLowerCase(),
            source: 'admin_created',
          }
        }
      },
      include: { aliases: true }
    });

    return jsonResponse({ skill }, 201);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return errorResponse(err.errors[0].message, 'VALIDATION_ERROR', 400);
    }
    return errorResponse(err.message || 'Failed to create skill', 'SERVER_ERROR', 500);
  }
}
