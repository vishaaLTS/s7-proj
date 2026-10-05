import { prisma } from '@/lib/db';
import { AIService } from './ai-service';
import { NotificationService } from './notification-service';

export class ATSService {
  public static async analyzeResumeForJob(userId: string, resumeId: string, jobId?: string, targetRoleTitle?: string) {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId }
    });

    if (!resume || !resume.parsedText) {
      throw new Error('Resume not found or raw text unavailable. Please upload a valid resume.');
    }

    let jobDescriptionText = '';
    if (jobId) {
      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (job) {
        jobDescriptionText = `${job.title} at company. ${job.description} Requirements: ${job.requirementsJson}`;
      }
    }

    if (!jobDescriptionText && targetRoleTitle) {
      jobDescriptionText = `Role: ${targetRoleTitle}. Required skills: Full Stack Development, React, Node.js, TypeScript, PostgreSQL, REST APIs, Git, Cloud services, Agile methodologies, Unit testing.`;
    }

    if (!jobDescriptionText) {
      jobDescriptionText = 'Software Engineer Role. Requirements: Web development, JavaScript, TypeScript, React, Node.js, Database management, Problem solving.';
    }

    // Call AIService for analysis
    const aiResult = await AIService.analyzeATS(resume.parsedText, jobDescriptionText);

    // Save ATS Analysis record
    const record = await prisma.aTSAnalysis.create({
      data: {
        userId,
        resumeId,
        jobId: jobId || null,
        targetRoleTitle: targetRoleTitle || 'Target Role',
        score: aiResult.data.score,
        keywordMatchPct: aiResult.data.keywordMatchPct,
        missingKeywordsJson: JSON.stringify(aiResult.data.missingKeywords),
        formattingScore: aiResult.data.formattingScore,
        feedbackJson: JSON.stringify({
          strengths: aiResult.data.strengths,
          improvements: aiResult.data.improvements,
          summary: aiResult.data.summary,
        }),
      }
    });

    await NotificationService.createNotification(
      userId,
      'ATS Compliance Scan Completed',
      `Your resume achieved an ATS score of ${aiResult.data.score}/100 with ${aiResult.data.keywordMatchPct}% keyword fit for ${targetRoleTitle || 'Target Role'}.`,
      'INFO'
    );

    return {
      ...record,
      missingKeywords: aiResult.data.missingKeywords,
      feedback: {
        strengths: aiResult.data.strengths,
        improvements: aiResult.data.improvements,
        summary: aiResult.data.summary,
      },
      provider: aiResult.provider,
    };
  }
}
