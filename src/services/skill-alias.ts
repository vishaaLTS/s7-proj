import { prisma } from '@/lib/db';

export class SkillAliasService {
  /**
   * Finds a canonical skill by raw skill string or alias.
   */
  public static async findSkillByAlias(rawSkillName: string) {
    const trimmed = rawSkillName.trim();
    if (!trimmed) return null;

    const lowerTrimmed = trimmed.toLowerCase();

    // 1. Exact or case-insensitive match on Skill name
    const allSkills = await prisma.skill.findMany({ include: { aliases: true } });
    const directMatch = allSkills.find(s => s.name.toLowerCase() === lowerTrimmed);
    if (directMatch) return directMatch;

    // 2. Check SkillAlias table
    const aliasMatch = await prisma.skillAlias.findFirst({
      where: {
        alias: lowerTrimmed
      },
      include: { skill: { include: { aliases: true } } }
    });

    if (aliasMatch && aliasMatch.skill) {
      return aliasMatch.skill;
    }

    return null;
  }

  /**
   * Normalizes an input skill string to its canonical database Skill model.
   * Creates the Skill and Alias if it does not already exist.
   */
  public static async normalizeAndGetSkill(rawSkillName: string, category = 'General') {
    const existing = await this.findSkillByAlias(rawSkillName);
    if (existing) return existing;

    const trimmed = rawSkillName.trim();
    const lowerTrimmed = trimmed.toLowerCase();

    // Create new canonical Skill if not found
    const newSkill = await prisma.skill.create({
      data: {
        name: trimmed,
        category,
        aliases: {
          create: {
            alias: lowerTrimmed,
            source: 'system_auto',
            confidence: 1.0
          }
        }
      }
    });

    return newSkill;
  }
}
