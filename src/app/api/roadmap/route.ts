import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';
import { RoadmapService } from '@/services/training-roadmap';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  const profile = await prisma.profile.findUnique({
    where: { userId: auth.user.userId }
  });

  if (!profile?.targetRoleId) {
    return jsonResponse({ roadmap: null });
  }

  let roadmap = await prisma.learningRoadmap.findFirst({
    where: { userId: auth.user.userId, jobRoleId: profile.targetRoleId, status: 'ACTIVE' },
    include: {
      tasks: {
        orderBy: [{ weekNumber: 'asc' }, { dayNumber: 'asc' }],
        include: { skill: true }
      }
    }
  });

  if (!roadmap) {
    // Generate new roadmap automatically
    roadmap = await RoadmapService.generateRoadmapForUser(auth.user.userId, profile.targetRoleId);
  }

  return jsonResponse({ roadmap });
}

export async function POST(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  const profile = await prisma.profile.findUnique({
    where: { userId: auth.user.userId }
  });

  if (!profile?.targetRoleId) {
    return errorResponse('Please select a target job role first', 'BAD_REQUEST', 400);
  }

  const roadmap = await RoadmapService.generateRoadmapForUser(auth.user.userId, profile.targetRoleId);
  return jsonResponse({ roadmap });
}
