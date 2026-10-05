import { prisma } from '@/lib/db';
import { SkillAliasService } from './skill-alias';

export class JobMatchingService {
  public static async calculateJobMatch(userId: string, jobId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true }
    });

    if (!job) throw new Error('Job not found');

    // 1. Fetch user skills & user experience & education
    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: { include: { aliases: true } } }
    });

    const userExperiences = await prisma.experience.findMany({
      where: { userId }
    });

    const userEducations = await prisma.education.findMany({
      where: { userId }
    });

    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    // Build skill lookup map (names + aliases)
    const userSkillNames = new Set<string>();
    userSkills.forEach((us) => {
      userSkillNames.add(us.skill.name.toLowerCase());
      us.skill.aliases.forEach((a) => userSkillNames.add(a.alias.toLowerCase()));
    });

    // Parse job requirements
    let requiredSkills: string[] = [];
    try {
      requiredSkills = JSON.parse(job.requirementsJson || '[]');
    } catch {
      requiredSkills = ['JavaScript', 'React', 'Node.js'];
    }

    // Match skills using canonical names & aliases
    let matchedSkillsCount = 0;
    const matchedList: string[] = [];
    const missingList: string[] = [];

    for (const reqSkillStr of requiredSkills) {
      const canonicalSkill = await SkillAliasService.findSkillByAlias(reqSkillStr);
      const isMatched = canonicalSkill
        ? userSkillNames.has(canonicalSkill.name.toLowerCase()) ||
          ((canonicalSkill as any).aliases || []).some((a: any) => userSkillNames.has(a.alias.toLowerCase()))
        : userSkillNames.has(reqSkillStr.toLowerCase());

      if (isMatched) {
        matchedSkillsCount++;
        matchedList.push(reqSkillStr);
      } else {
        missingList.push(reqSkillStr);
      }
    }

    const skillMatchPct =
      requiredSkills.length > 0 ? Math.round((matchedSkillsCount / requiredSkills.length) * 100) : 100;

    // 2. Calculate Real Experience Match Percentage
    let totalExperienceMonths = 0;
    userExperiences.forEach((exp) => {
      const start = new Date(exp.startDate).getTime();
      const end = exp.current || !exp.endDate ? Date.now() : new Date(exp.endDate).getTime();
      const months = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24 * 30)));
      totalExperienceMonths += months;
    });

    const experienceYears = totalExperienceMonths / 12;
    const isMidOrSenior = (job.title + ' ' + job.description).toLowerCase().includes('senior') || (job.title + ' ' + job.description).toLowerCase().includes('lead');
    const requiredMinYears = isMidOrSenior ? 3.0 : 1.0;

    let experienceMatchPct = Math.min(100, Math.round((experienceYears / requiredMinYears) * 100));
    if (userExperiences.length === 0) {
      experienceMatchPct = 50;
    }

    // 3. Calculate Real Education Match Percentage
    let educationMatchPct = 50;
    const hasDegree = userEducations.length > 0 || Boolean(profile?.degree) || Boolean(profile?.institution);
    if (hasDegree) {
      const degreeText = (
        (userEducations[0]?.degree || '') +
        ' ' +
        (userEducations[0]?.fieldOfStudy || '') +
        ' ' +
        (profile?.degree || '')
      ).toLowerCase();

      if (
        degreeText.includes('computer') ||
        degreeText.includes('engineering') ||
        degreeText.includes('technology') ||
        degreeText.includes('b.tech') ||
        degreeText.includes('b.e') ||
        degreeText.includes('bca') ||
        degreeText.includes('mca') ||
        degreeText.includes('b.sc')
      ) {
        educationMatchPct = 100;
      } else {
        educationMatchPct = 75;
      }
    }

    // Weighted Overall Job Match %
    const matchPercentage = Math.round(
      skillMatchPct * 0.6 + experienceMatchPct * 0.25 + educationMatchPct * 0.15
    );

    const matchBreakdown = {
      matchedSkills: matchedList,
      missingSkills: missingList,
      skillMatchPct,
      experienceMatchPct,
      educationMatchPct,
      experienceYears: Math.round(experienceYears * 10) / 10,
      explanation: `Matched ${matchedSkillsCount} of ${requiredSkills.length} required skills (${skillMatchPct}% skill fit). Experience fit: ${experienceMatchPct}%, Education fit: ${educationMatchPct}%.`,
    };

    const recordId = `${userId}_${jobId}`;
    const record = await prisma.jobMatch.upsert({
      where: { id: recordId },
      create: {
        id: recordId,
        userId,
        jobId,
        matchPercentage,
        skillMatchPct,
        experienceMatchPct,
        educationMatchPct,
        matchBreakdownJson: JSON.stringify(matchBreakdown),
      },
      update: {
        matchPercentage,
        skillMatchPct,
        experienceMatchPct,
        educationMatchPct,
        matchBreakdownJson: JSON.stringify(matchBreakdown),
      }
    });

    return {
      ...record,
      job,
      matchBreakdown,
    };
  }

  public static async getRecommendationsForUser(userId: string) {
    const jobs = await prisma.job.findMany({
      where: { status: 'ACTIVE' },
      include: { company: true },
      take: 30,
    });

    const recommendations = [];
    for (const job of jobs) {
      const match = await this.calculateJobMatch(userId, job.id);
      recommendations.push(match);
    }

    recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);
    return recommendations;
  }
}
