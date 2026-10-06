import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    const userId = auth.user.userId;

    // Fetch user target company & role skill gaps
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    let skillGaps: any[] = [];
    if (profile?.targetCompanyId && profile?.targetRoleId) {
      skillGaps = await prisma.skillGap.findMany({
        where: {
          userId,
          companyId: profile.targetCompanyId,
          jobRoleId: profile.targetRoleId,
        },
        include: { skill: true }
      });
    }

    const missingSkillNames = skillGaps
      .filter((g) => g.status === 'MISSING' || g.status === 'PRIORITY' || g.status === 'PARTIAL')
      .map((g) => g.skill.name);

    const projects = await prisma.project.findMany({
      include: {
        userProjects: {
          where: { userId }
        }
      }
    });

    const recommendations = projects.map((p) => {
      let techStack: string[] = [];
      try {
        techStack = JSON.parse(p.techStackJson || '[]');
      } catch {
        techStack = [];
      }

      const userProject = p.userProjects[0];

      const coveredGaps = techStack.filter((t) =>
        missingSkillNames.some((m) => m.toLowerCase() === t.toLowerCase())
      );

      let why = `Recommended to build portfolio experience in ${techStack.slice(0, 3).join(', ')}.`;
      if (coveredGaps.length > 0) {
        why = `Recommended because it covers ${coveredGaps.length} of your highest-priority skill gaps (${coveredGaps.join(', ')}).`;
      }

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
        coveredGapsCount: coveredGaps.length,
        why,
        // Include full userProject for workspace modal pre-fill
        userProject: userProject || null,
      };
    });

    recommendations.sort((a, b) => b.coveredGapsCount - a.coveredGapsCount);

    return jsonResponse({ projects: recommendations });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to fetch recommended projects', 'SERVER_ERROR', 500);
  }
}
