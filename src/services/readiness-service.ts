import { prisma } from '@/lib/db';
import { ScoreEngine, ScoreBreakdown } from './score-engine';
import { SkillGapService } from './skill-gap';

export class ReadinessService {
  public static async getUserReadiness(
    userId: string,
    targetCompanyId?: string,
    targetRoleId?: string
  ): Promise<{
    hasTarget: boolean;
    companyName?: string;
    jobRoleTitle?: string;
    readiness: ScoreBreakdown;
    gapSummary?: {
      matchedCount: number;
      partialCount: number;
      missingCount: number;
      totalCount: number;
    };
  }> {
    // 1. Fetch user profile to identify target if not passed
    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    const companyId = targetCompanyId || profile?.targetCompanyId;
    const jobRoleId = targetRoleId || profile?.targetRoleId;

    let companyName: string | undefined;
    let jobRoleTitle: string | undefined;
    let matchedCount = 0;
    let partialCount = 0;
    let totalCount = 0;

    if (companyId && jobRoleId) {
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      const jobRole = await prisma.jobRole.findUnique({ where: { id: jobRoleId } });
      companyName = company?.name;
      jobRoleTitle = jobRole?.title;

      const gapAnalysis = await SkillGapService.analyzeSkillGap(userId, companyId, jobRoleId);
      matchedCount = gapAnalysis.matchedCount;
      partialCount = gapAnalysis.partialCount;
      totalCount = gapAnalysis.totalCount;
    }

    // 2. Fetch User Assessment Performance
    const assessmentResults = await prisma.assessmentResult.findMany({
      where: { userId }
    });
    const assessmentScores = assessmentResults.map((r) => r.percentage);

    // 3. Fetch Completed Projects
    const userProjects = await prisma.userProject.findMany({
      where: { userId, status: 'COMPLETED' }
    });

    // 4. Fetch Latest ATS Score
    const latestATS = await prisma.aTSAnalysis.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // 5. Fetch Latest Interview Score
    const latestInterviewResult = await prisma.interviewResult.findFirst({
      where: {
        interview: { userId }
      },
      orderBy: { completedAt: 'desc' }
    });

    // 6. Calculate Readiness Score
    const readiness = ScoreEngine.calculateReadiness({
      matchedSkillsCount: matchedCount,
      partialSkillsCount: partialCount,
      totalRequiredSkillsCount: totalCount > 0 ? totalCount : 5,
      assessmentScores: assessmentScores.length > 0 ? assessmentScores : undefined,
      completedProjectsCount: userProjects.length,
      totalRecommendedProjectsCount: 3,
      latestATSScore: latestATS ? latestATS.score : undefined,
      latestInterviewScore: latestInterviewResult ? latestInterviewResult.overallScore : undefined,
    });

    return {
      hasTarget: Boolean(companyId && jobRoleId),
      companyName,
      jobRoleTitle,
      readiness,
      gapSummary: {
        matchedCount,
        partialCount,
        missingCount: Math.max(0, totalCount - matchedCount - partialCount),
        totalCount,
      }
    };
  }
}
