import { NextRequest } from 'next/server';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';
import { InterviewService } from '@/services/interview-service';
import { z } from 'zod';

const AnswerSchema = z.object({
  questionId: z.string().min(1),
  userAnswer: z.string().min(3, 'Answer is too short'),
});

export async function POST(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const parsed = AnswerSchema.parse(body);

    const result = await InterviewService.submitAnswer(parsed.questionId, parsed.userAnswer, auth.user.userId);
    return jsonResponse(result);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return errorResponse(err.errors[0].message, 'VALIDATION_ERROR', 400);
    }
    return errorResponse(err.message || 'Failed to submit interview answer', 'SERVER_ERROR', 500);
  }
}
