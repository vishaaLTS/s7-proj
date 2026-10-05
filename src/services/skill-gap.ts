import { prisma } from '@/lib/db';

export type SkillLevel = 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE' | 'UPPER_INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type SkillGapStatus = 'MATCHED' | 'PARTIAL' | 'MISSING' | 'PRIORITY';
export type RequirementImportance = 'REQUIRED' | 'PREFERRED';

const LEVEL_WEIGHTS: Record<SkillLevel, number> = {
  BEGINNER: 1,
  ELEMENTARY: 2,
  INTERMEDIATE: 3,
  UPPER_INTERMEDIATE: 4,
  ADVANCED: 5,
  EXPERT: 6,
};

export class SkillGapService {
  public static async analyzeSkillGap(userId: string, companyId: string, jobRoleId: string) {
    // 1. Fetch CompanyJobRole requirements
    const companyJobRole = await prisma.companyJobRole.findFirst({
      where: { companyId, jobRoleId },
      include: {
        skillRequirements: {
          include: { skill: true }
        }
      }
    });

    if (!companyJobRole || companyJobRole.skillRequirements.length === 0) {
      return { skillGaps: [], matchedCount: 0, partialCount: 0, missingCount: 0, totalCount: 0 };
    }

    // 2. Fetch User Verified Skills
    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true }
    });

    const userSkillMap = new Map<string, { level: SkillLevel; isVerified: boolean }>();
    userSkills.forEach(us => {
      userSkillMap.set(us.skillId, { level: us.proficiencyLevel as SkillLevel, isVerified: us.isVerified });
    });

    const results = [];
    let matchedCount = 0;
    let partialCount = 0;
    let missingCount = 0;

    // Delete existing gaps for this user/company/role combo
    await prisma.skillGap.deleteMany({
      where: { userId, companyId, jobRoleId }
    });

    for (const req of companyJobRole.skillRequirements) {
      const userHasSkill = userSkillMap.get(req.skillId);
      const reqVal = LEVEL_WEIGHTS[req.requiredLevel as SkillLevel] || 3;

      let status: SkillGapStatus = 'MISSING';
      let currentLevel: SkillLevel = 'BEGINNER';
      let gapScore = 100;

      if (userHasSkill) {
        currentLevel = userHasSkill.level;
        const userVal = LEVEL_WEIGHTS[currentLevel] || 1;

        if (userVal >= reqVal) {
          status = 'MATCHED';
          gapScore = 0;
          matchedCount++;
        } else {
          status = req.importance === 'REQUIRED' ? 'PRIORITY' : 'PARTIAL';
          gapScore = Math.round(((reqVal - userVal) / reqVal) * 100);
          partialCount++;
        }
      } else {
        status = req.importance === 'REQUIRED' ? 'PRIORITY' : 'MISSING';
        gapScore = 100;
        missingCount++;
      }

      let recommendationText = `Acquire ${req.skill.name} to target level ${req.requiredLevel}.`;
      if (status === 'MATCHED') {
        recommendationText = `Skill requirement fulfilled! Maintain proficiency.`;
      } else if (status === 'PARTIAL') {
        recommendationText = `Upgrade ${req.skill.name} from ${currentLevel} to ${req.requiredLevel}.`;
      } else if (status === 'PRIORITY') {
        recommendationText = `CRITICAL PRIORITY: ${req.skill.name} is required by target company. Prioritize in learning roadmap.`;
      }

      // Persist in DB
      const gapRecord = await prisma.skillGap.create({
        data: {
          userId,
          companyId,
          jobRoleId,
          skillId: req.skillId,
          status,
          currentLevel,
          requiredLevel: req.requiredLevel,
          gapScore,
          recommendationText,
        },
        include: { skill: true }
      });

      results.push(gapRecord);
    }

    return {
      skillGaps: results,
      matchedCount,
      partialCount,
      missingCount,
      totalCount: companyJobRole.skillRequirements.length
    };
  }
}
