import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';
import { SkillAliasService } from '@/services/skill-alias';
import { z } from 'zod';

const AddUserSkillSchema = z.object({
  skillName: z.string().min(1),
  proficiencyLevel: z.enum(['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'UPPER_INTERMEDIATE', 'ADVANCED', 'EXPERT']).default('INTERMEDIATE'),
  category: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  const catalog = await prisma.skill.findMany({
    orderBy: { name: 'asc' },
    include: { aliases: true }
  });

  const userSkills = await prisma.userSkill.findMany({
    where: { userId: auth.user.userId },
    include: { skill: true }
  });

  return jsonResponse({
    catalog,
    userSkills,
  });
}

export async function POST(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const parsed = AddUserSkillSchema.parse(body);

    const canonicalSkill = await SkillAliasService.normalizeAndGetSkill(parsed.skillName, parsed.category || 'General');
    if (!canonicalSkill) {
      return errorResponse('Invalid skill name', 'BAD_REQUEST', 400);
    }

    const userSkill = await prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: auth.user.userId,
          skillId: canonicalSkill.id,
        }
      },
      create: {
        userId: auth.user.userId,
        skillId: canonicalSkill.id,
        proficiencyLevel: parsed.proficiencyLevel,
        isVerified: true,
        verifiedAt: new Date(),
        evidence: 'Manually verified by candidate in Skill Profile',
      },
      update: {
        proficiencyLevel: parsed.proficiencyLevel,
        isVerified: true,
        verifiedAt: new Date(),
      },
      include: { skill: true }
    });

    return jsonResponse({ userSkill }, 201);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return errorResponse(err.errors[0].message, 'VALIDATION_ERROR', 400);
    }
    return errorResponse(err.message || 'Failed to add skill', 'SERVER_ERROR', 500);
  }
}
