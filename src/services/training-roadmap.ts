import { prisma } from '@/lib/db';
import { NotificationService } from './notification-service';

export class RoadmapService {
  /**
   * Calculates actual date-based consecutive learning streak.
   */
  public static calculateRealStreak(completedAtDates: (Date | null)[]): number {
    const validDates = completedAtDates
      .filter((d): d is Date => Boolean(d))
      .map((d) => {
        const dateObj = new Date(d);
        return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      });

    const uniqueDates = Array.from(new Set(validDates)).sort().reverse();
    if (uniqueDates.length === 0) return 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    // Check if streak is active (completed today or yesterday)
    let currentCheckDate = new Date();
    if (uniqueDates[0] === todayStr) {
      currentCheckDate = new Date();
    } else if (uniqueDates[0] === yesterdayStr) {
      currentCheckDate = yesterdayDate;
    } else {
      // Streak broken (gap > 1 day)
      return 0;
    }

    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const checkStr = currentCheckDate.toISOString().split('T')[0];
      if (uniqueDates.includes(checkStr)) {
        streak++;
        currentCheckDate.setDate(currentCheckDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  public static async generateRoadmapForUser(userId: string, jobRoleId: string) {
    const jobRole = await prisma.jobRole.findUnique({ where: { id: jobRoleId } });
    if (!jobRole) throw new Error('Job role not found');

    // Find missing/priority skill gaps for user
    const skillGaps = await prisma.skillGap.findMany({
      where: { userId, jobRoleId },
      include: { skill: true }
    });

    // Delete existing active roadmap for this role if any
    await prisma.learningRoadmap.deleteMany({
      where: { userId, jobRoleId }
    });

    const roadmap = await prisma.learningRoadmap.create({
      data: {
        userId,
        jobRoleId,
        title: `Bridge Training Roadmap: ${jobRole.title}`,
        status: 'ACTIVE',
      }
    });

    let totalTasks = 0;
    let estimatedHours = 0;

    const targetGaps = skillGaps.filter(g => g.status !== 'MATCHED');
    const gapsToProcess = targetGaps.length > 0 ? targetGaps : skillGaps;

    let weekNumber = 1;
    let dayNumber = 1;

    for (const gap of gapsToProcess) {
      const resource = await prisma.trainingResource.findFirst({
        where: { skillId: gap.skillId }
      });

      const resourceUrl = resource?.url || `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(gap.skill.name)}`;

      await prisma.learningTask.create({
        data: {
          roadmapId: roadmap.id,
          weekNumber,
          dayNumber: (dayNumber % 7) + 1,
          skillId: gap.skillId,
          title: `Prerequisite & Fundamentals: ${gap.skill.name}`,
          description: `Study core syntax, principles, and prerequisites for ${gap.skill.name}. Upgrade from ${gap.currentLevel} to ${gap.requiredLevel}.`,
          resourceUrl,
          practiceTask: `Build a mini demo project implementing ${gap.skill.name} best practices.`,
          estimatedMinutes: 120,
        }
      });

      await prisma.learningTask.create({
        data: {
          roadmapId: roadmap.id,
          weekNumber: weekNumber + 1,
          dayNumber: ((dayNumber + 3) % 7) + 1,
          skillId: gap.skillId,
          title: `Advanced Integration & Testing: ${gap.skill.name}`,
          description: `Integrate ${gap.skill.name} into full-stack architectures. Add error handling and unit tests.`,
          resourceUrl,
          practiceTask: `Write unit and integration tests for your ${gap.skill.name} implementation.`,
          estimatedMinutes: 180,
        }
      });

      totalTasks += 2;
      estimatedHours += 5.0;

      dayNumber += 2;
      if (dayNumber > 7) {
        dayNumber = 1;
        weekNumber += 2;
      }
    }

    const updatedRoadmap = await prisma.learningRoadmap.update({
      where: { id: roadmap.id },
      data: {
        totalTasks,
        estimatedHours,
      },
      include: {
        tasks: {
          include: { skill: true }
        }
      }
    });

    return updatedRoadmap;
  }

  public static async toggleTaskCompletion(taskId: string, userId: string) {
    const task = await prisma.learningTask.findUnique({
      where: { id: taskId },
      include: { roadmap: true }
    });

    if (!task || task.roadmap.userId !== userId) {
      throw new Error('Task not found or unauthorized');
    }

    const nextState = !task.isCompleted;

    await prisma.learningTask.update({
      where: { id: taskId },
      data: {
        isCompleted: nextState,
        completedAt: nextState ? new Date() : null,
      }
    });

    // Recalculate roadmap progress & real streak
    const allTasks = await prisma.learningTask.findMany({
      where: { roadmapId: task.roadmapId }
    });

    const completedTasks = allTasks.filter(t => t.isCompleted);
    const completedCount = completedTasks.length;
    const completedHours = completedTasks.reduce((acc, curr) => acc + curr.estimatedMinutes / 60, 0);

    const realStreak = this.calculateRealStreak(completedTasks.map(t => t.completedAt));

    const updatedRoadmap = await prisma.learningRoadmap.update({
      where: { id: task.roadmapId },
      data: {
        completedTasks: completedCount,
        completedHours,
        streakDays: realStreak,
      }
    });

    if (nextState) {
      await NotificationService.createNotification(
        userId,
        'Training Task Completed ✓',
        `You completed "${task.title}". Your learning streak is now ${realStreak} days!`,
        'SUCCESS'
      );
    }

    return { task: { ...task, isCompleted: nextState }, roadmap: updatedRoadmap };
  }
}
