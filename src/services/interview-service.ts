import { prisma } from '@/lib/db';
import { AIService } from './ai-service';

export type InterviewMode = 'TECHNICAL' | 'HR' | 'BEHAVIORAL' | 'MIXED';

export class InterviewService {
  public static async startMockInterview(userId: string, companyId: string, jobRoleId: string, mode: InterviewMode = 'TECHNICAL') {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    const jobRole = await prisma.jobRole.findUnique({ where: { id: jobRoleId } });

    if (!company || !jobRole) throw new Error('Company or Job Role not found');

    // Fetch user's priority skill gaps for customized question context
    const skillGaps = await prisma.skillGap.findMany({
      where: { userId, companyId, jobRoleId, status: { in: ['MISSING', 'PRIORITY', 'PARTIAL'] } },
      include: { skill: true },
      take: 2
    });

    const gapNames = skillGaps.map(g => g.skill.name).join(', ') || 'System Architecture';

    // Create MockInterview session
    const interview = await prisma.mockInterview.create({
      data: {
        userId,
        companyId,
        jobRoleId,
        mode,
        status: 'IN_PROGRESS',
      }
    });

    // Generate 4 dynamic interview questions based on company, role, & skill gaps
    const sampleQuestions = [
      {
        questionText: `Can you walk us through your technical background and why you are interested in joining ${company.name} as a ${jobRole.title}?`,
        category: 'HR / Behavioral',
        order: 1,
      },
      {
        questionText: `Describe a challenging technical problem you solved involving ${gapNames}. What tools or frameworks did you choose and why?`,
        category: 'TECHNICAL',
        order: 2,
      },
      {
        questionText: `How do you approach database schema design, indexing, and RESTful API optimization for high-concurrency web applications at ${company.name}?`,
        category: 'TECHNICAL',
        order: 3,
      },
      {
        questionText: `Tell me about a situation where you had a conflict of opinion regarding technical architecture or code reviews. How did you resolve it?`,
        category: 'BEHAVIORAL',
        order: 4,
      },
    ];

    for (const q of sampleQuestions) {
      await prisma.interviewQuestion.create({
        data: {
          interviewId: interview.id,
          questionText: q.questionText,
          category: q.category,
          order: q.order,
          suggestedAnswer: `A strong candidate should explain their experience, cite specific technologies (e.g., React, Node.js, PostgreSQL), and demonstrate structured problem solving.`,
        }
      });
    }

    return prisma.mockInterview.findUnique({
      where: { id: interview.id },
      include: {
        company: true,
        jobRole: true,
        questions: {
          orderBy: { order: 'asc' },
          include: { answer: true }
        }
      }
    });
  }

  public static async submitAnswer(questionId: string, userAnswerText: string, userId: string) {
    const question = await prisma.interviewQuestion.findUnique({
      where: { id: questionId },
      include: { interview: true }
    });

    if (!question) throw new Error('Question not found');

    // Strict Ownership Check
    if (question.interview.userId !== userId) {
      throw new Error('FORBIDDEN: You do not own this interview question');
    }

    // Evaluate answer with AI Service
    const aiEval = await AIService.evaluateInterviewAnswer(
      question.questionText,
      userAnswerText,
      question.category
    );

    // Save or update InterviewAnswer
    const answer = await prisma.interviewAnswer.upsert({
      where: { questionId },
      create: {
        questionId,
        userAnswer: userAnswerText,
        aiFeedbackJson: JSON.stringify({
          feedback: aiEval.data.feedback,
          strengths: aiEval.data.strengths,
          improvements: aiEval.data.improvements,
          suggestedAnswer: aiEval.data.suggestedAnswer,
        }),
        score: aiEval.data.score,
        clarityScore: aiEval.data.clarityScore,
        relevanceScore: aiEval.data.relevanceScore,
        technicalScore: aiEval.data.technicalScore,
      },
      update: {
        userAnswer: userAnswerText,
        aiFeedbackJson: JSON.stringify({
          feedback: aiEval.data.feedback,
          strengths: aiEval.data.strengths,
          improvements: aiEval.data.improvements,
          suggestedAnswer: aiEval.data.suggestedAnswer,
        }),
        score: aiEval.data.score,
        clarityScore: aiEval.data.clarityScore,
        relevanceScore: aiEval.data.relevanceScore,
        technicalScore: aiEval.data.technicalScore,
      }
    });

    // Check if all questions answered to finalize interview
    const allQuestions = await prisma.interviewQuestion.findMany({
      where: { interviewId: question.interviewId },
      include: { answer: true }
    });

    const answeredCount = allQuestions.filter(q => q.answer !== null || q.id === questionId).length;

    if (answeredCount === allQuestions.length) {
      await this.finalizeInterview(question.interviewId);
    }

    return { answer, evaluation: aiEval.data, provider: aiEval.provider };
  }

  private static async finalizeInterview(interviewId: string) {
    const questions = await prisma.interviewQuestion.findMany({
      where: { interviewId },
      include: { answer: true }
    });

    const validScores = questions
      .map(q => q.answer?.score || 0)
      .filter(s => s > 0);

    const overallScore = validScores.length > 0
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : 70;

    await prisma.interviewResult.upsert({
      where: { interviewId },
      create: {
        interviewId,
        overallScore,
        strengthsJson: JSON.stringify(['Clear communication', 'Solid architectural fundamentals', 'Professional tone']),
        weaknessesJson: JSON.stringify(['Could expand on quantitative performance metrics', 'Include edge-case error scenarios']),
        recommendationsJson: JSON.stringify(['Practice STAR format (Situation, Task, Action, Result)', 'Review system design scaling principles']),
      },
      update: {
        overallScore,
      }
    });

    await prisma.mockInterview.update({
      where: { id: interviewId },
      data: { status: 'COMPLETED' }
    });
  }
}
