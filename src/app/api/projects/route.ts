import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    const projects = await prisma.project.findMany({
      include: {
        userProjects: {
          where: { userId: auth.user.userId }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = projects.map((p) => {
      let techStack: string[] = [];
      try {
        techStack = JSON.parse(p.techStackJson || '[]');
      } catch {
        techStack = [];
      }

      const userProject = p.userProjects[0];
      return {
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        description: p.description,
        techStack,
        learningOutcomes: p.learningOutcomes,
        estimatedHours: p.estimatedHours,
        status: userProject?.status || 'NOT_STARTED',
        repoUrl: userProject?.repoUrl,
        liveUrl: userProject?.liveUrl,
        submittedAt: userProject?.submittedAt,
      };
    });

    return jsonResponse({ projects: formatted });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to fetch projects', 'SERVER_ERROR', 500);
  }
}
