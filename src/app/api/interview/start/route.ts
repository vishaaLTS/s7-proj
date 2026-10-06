import { NextRequest } from 'next/server';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';
import { InterviewService } from '@/services/interview-service';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const StartInterviewSchema = z.object({
  companyId: z.string().min(1),
  jobRoleId: z.string().min(1),
  mode: z.enum(['TECHNICAL', 'HR', 'BEHAVIORAL', 'MIXED']).default('TECHNICAL'),
});

export async function POST(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const parsed = StartInterviewSchema.parse(body);

    const interview = await InterviewService.startMockInterview(
      auth.user.userId,
      parsed.companyId,
      parsed.jobRoleId,
      parsed.mode
    );

    return jsonResponse({ interview }, 201);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return errorResponse(err.errors[0].message, 'VALIDATION_ERROR', 400);
    }
    return errorResponse(err.message || 'Failed to start interview', 'SERVER_ERROR', 500);
  }
}
