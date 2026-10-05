import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';
import { z } from 'zod';

const SubmitAssessmentSchema = z.object({
  assessmentId: z.string().min(1),
  answers: z.record(z.string()), // questionId -> answer string
});

export async function POST(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const parsed = SubmitAssessmentSchema.parse(body);

    const assessment = await prisma.assessment.findUnique({
      where: { id: parsed.assessmentId },
      include: { questions: true }
    });

    if (!assessment) return errorResponse('Assessment not found', 'NOT_FOUND', 404);

    let score = 0;
    let maxScore = 0;

    assessment.questions.forEach(q => {
      maxScore += q.points;
      const userAnswer = parsed.answers[q.id];
      if (userAnswer && userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        score += q.points;
      }
    });

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const passed = percentage >= assessment.passPercentage;

    const result = await prisma.assessmentResult.create({
      data: {
        userId: auth.user.userId,
        assessmentId: parsed.assessmentId,
        score,
        maxScore,
        percentage,
        passed,
        answersJson: JSON.stringify(parsed.answers),
      }
    });

    return jsonResponse({ result, percentage, passed });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return errorResponse(err.errors[0].message, 'VALIDATION_ERROR', 400);
    }
    return errorResponse(err.message || 'Assessment submission failed', 'SERVER_ERROR', 500);
  }
}
