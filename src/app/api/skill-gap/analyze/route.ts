import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';
import { ReadinessService } from '@/services/readiness-service';
import { SkillGapService } from '@/services/skill-gap';
import { z } from 'zod';

const AnalyzeGapSchema = z.object({
  companyId: z.string().min(1),
  jobRoleId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const parsed = AnalyzeGapSchema.parse(body);

    // Save target company & role in user profile
    await prisma.profile.update({
      where: { userId: auth.user.userId },
      data: {
        targetCompanyId: parsed.companyId,
        targetRoleId: parsed.jobRoleId,
      }
    });

    // Run Skill Gap Analysis
    await SkillGapService.analyzeSkillGap(auth.user.userId, parsed.companyId, parsed.jobRoleId);

    // Use single authoritative ReadinessService
    const readinessData = await ReadinessService.getUserReadiness(
      auth.user.userId,
      parsed.companyId,
      parsed.jobRoleId
    );

    // Log progress snapshot
    await prisma.progress.create({
      data: {
        userId: auth.user.userId,
        readinessScore: readinessData.readiness.overallReadinessScore,
        skillCount: readinessData.gapSummary?.matchedCount || 0,
      }
    });

    return jsonResponse({
      ...readinessData,
      targetCompanyId: parsed.companyId,
      targetRoleId: parsed.jobRoleId,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return errorResponse(err.errors[0].message, 'VALIDATION_ERROR', 400);
    }
    return errorResponse(err.message || 'Skill gap analysis failed', 'SERVER_ERROR', 500);
  }
}

export async function GET(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  const profile = await prisma.profile.findUnique({
    where: { userId: auth.user.userId }
  });

  if (!profile?.targetCompanyId || !profile?.targetRoleId) {
    const defaultReadiness = await ReadinessService.getUserReadiness(auth.user.userId);
    return jsonResponse({
      skillGaps: [],
      ...defaultReadiness,
    });
  }

  const skillGaps = await prisma.skillGap.findMany({
    where: {
      userId: auth.user.userId,
      companyId: profile.targetCompanyId,
      jobRoleId: profile.targetRoleId,
    },
    include: { skill: true }
  });

  const readinessData = await ReadinessService.getUserReadiness(
    auth.user.userId,
    profile.targetCompanyId,
    profile.targetRoleId
  );

  return jsonResponse({
    companyId: profile.targetCompanyId,
    jobRoleId: profile.targetRoleId,
    skillGaps,
    ...readinessData,
  });
}
