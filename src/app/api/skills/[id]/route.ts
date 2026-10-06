import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const UpdateSkillSchema = z.object({
  proficiencyLevel: z.enum(['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'UPPER_INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  isVerified: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const parsed = UpdateSkillSchema.parse(body);

    const userSkill = await prisma.userSkill.update({
      where: { id: params.id },
      data: {
        ...(parsed.proficiencyLevel && { proficiencyLevel: parsed.proficiencyLevel }),
        ...(parsed.isVerified !== undefined && {
          isVerified: parsed.isVerified,
          verifiedAt: parsed.isVerified ? new Date() : null,
        }),
      },
      include: { skill: true }
    });

    return jsonResponse({ userSkill });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to update user skill', 'SERVER_ERROR', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    await prisma.userSkill.delete({
      where: { id: params.id }
    });

    return jsonResponse({ message: 'User skill removed successfully' });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to remove user skill', 'SERVER_ERROR', 500);
  }
}
