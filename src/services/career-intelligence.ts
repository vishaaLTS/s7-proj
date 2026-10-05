import { prisma } from '@/lib/db';
import { ReadinessService } from './readiness-service';
import { JobMatchingService } from './job-matching';

export class CareerIntelligenceService {
  public static async getCareerIntelligencePipeline(userId: string) {
    // 1. Candidate Profile & User info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        educations: true,
        experiences: true,
      }
    });

    if (!user) throw new Error('User not found');

    // 2. Verified Candidate Skills
    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: {
        skill: true,
        evidencesList: true,
      },
      orderBy: { numericScore: 'desc' }
    });

    // 3. Target Readiness & Skill Gap
    const readinessData = await ReadinessService.getUserReadiness(userId);

    // 4. Skill Gaps for target role
    let skillGaps: any[] = [];
    if (user.profile?.targetCompanyId && user.profile?.targetRoleId) {
      skillGaps = await prisma.skillGap.findMany({
        where: {
          userId,
          companyId: user.profile.targetCompanyId,
          jobRoleId: user.profile.targetRoleId,
        },
        include: { skill: true }
      });
    }

    const missingSkillIds = skillGaps
      .filter((g) => g.status === 'MISSING' || g.status === 'PRIORITY' || g.status === 'PARTIAL')
      .map((g) => g.skillId);

    const missingSkillNames = skillGaps
      .filter((g) => g.status === 'MISSING' || g.status === 'PRIORITY' || g.status === 'PARTIAL')
      .map((g) => g.skill.name);

    // 5. Recommended Training Resources
    const trainingResources = await prisma.trainingResource.findMany({
      where: missingSkillIds.length > 0 ? { skillId: { in: missingSkillIds } } : {},
      include: { skill: true },
      take: 6,
    });

    const recommendedTraining = trainingResources.map((t) => ({
      ...t,
      why: `Recommended because it bridges your gap in ${t.skill.name} for target role ${readinessData.jobRoleTitle || 'Full Stack Developer'}.`
    }));

    // 6. Recommended Projects
    const projects = await prisma.project.findMany({
      take: 10,
    });

    const recommendedProjects = projects.map((p) => {
      let techStack: string[] = [];
      try {
        techStack = JSON.parse(p.techStackJson || '[]');
      } catch {
        techStack = [];
      }

      const coveredGaps = techStack.filter((t) =>
        missingSkillNames.some((m) => m.toLowerCase() === t.toLowerCase())
      );

      const why = coveredGaps.length > 0
        ? `Covers ${coveredGaps.length} of your high-priority skill gaps (${coveredGaps.join(', ')}).`
        : `Recommended to strengthen full-stack portfolio experience for ${readinessData.jobRoleTitle || 'software engineering'}.`;

      return {
        ...p,
        techStack,
        coveredGapsCount: coveredGaps.length,
        why,
      };
    });

    // Sort projects by gap coverage
    recommendedProjects.sort((a, b) => b.coveredGapsCount - a.coveredGapsCount);

    // 7. Recommended Jobs
    const jobRecommendations = await JobMatchingService.getRecommendationsForUser(userId);

    // 8. Interview Preparation Focus Topics
    const interviewPrepTopics = missingSkillNames.length > 0
      ? missingSkillNames
      : ['System Design', 'Algorithms', 'REST APIs', 'React Performance'];

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        educations: user.educations,
        experiences: user.experiences,
      },
      userSkills,
      readinessData,
      skillGaps,
      recommendedTraining,
      recommendedProjects: recommendedProjects.slice(0, 5),
      jobRecommendations: jobRecommendations.slice(0, 5),
      interviewPrepTopics,
    };
  }
}
