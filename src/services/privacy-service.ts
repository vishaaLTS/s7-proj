import { prisma } from '@/lib/db';
import { FileStorageService } from './file-storage';
import { AuditLogger } from './audit-logger';

export class PrivacyService {
  /**
   * Export all user stored data for privacy compliance (GDPR/DPDP).
   */
  public static async exportUserData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        educations: true,
        experiences: true,
        userSkills: { include: { skill: true } },
        resumes: { include: { analysis: true } },
        assessmentResults: true,
        userProjects: { include: { project: true } },
        atsAnalyses: true,
        mockInterviews: { include: { result: true } },
        jobApplications: { include: { job: true } },
      }
    });

    if (!user) throw new Error('User not found');

    await AuditLogger.logAction(userId, 'DATA_EXPORT', 'USER', userId);

    return {
      exportedAt: new Date().toISOString(),
      user,
    };
  }

  /**
   * Permanently delete a specific resume file asset and database record.
   */
  public static async deleteResume(userId: string, resumeId: string) {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
      include: { fileAsset: true }
    });

    if (!resume) throw new Error('Resume not found or unauthorized');

    // Delete file from storage
    if (resume.fileAsset) {
      await FileStorageService.deleteFile(resume.fileAsset.storageKey, userId);
    }

    // Delete database record (cascades to ResumeAnalysis)
    await prisma.resume.delete({
      where: { id: resumeId }
    });

    await AuditLogger.logAction(userId, 'RESUME_DELETE', 'RESUME', resumeId);

    return true;
  }

  /**
   * Permanently delete user account and all associated data.
   */
  public static async deleteAccount(userId: string) {
    const userResumes = await prisma.resume.findMany({
      where: { userId },
      include: { fileAsset: true }
    });

    for (const r of userResumes) {
      if (r.fileAsset) {
        await FileStorageService.deleteFile(r.fileAsset.storageKey, userId);
      }
    }

    await AuditLogger.logAction(userId, 'ACCOUNT_DELETE', 'USER', userId);

    await prisma.user.delete({
      where: { id: userId }
    });

    return true;
  }
}
