import { NextRequest } from 'next/server';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';
import { ATSService } from '@/services/ats-service';
import { z } from 'zod';

const ATSReqSchema = z.object({
  resumeId: z.string().min(1),
  jobId: z.string().optional(),
  targetRoleTitle: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const parsed = ATSReqSchema.parse(body);

    const result = await ATSService.analyzeResumeForJob(
      auth.user.userId,
      parsed.resumeId,
      parsed.jobId,
      parsed.targetRoleTitle
    );

    return jsonResponse({ atsResult: result });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return errorResponse(err.errors[0].message, 'VALIDATION_ERROR', 400);
    }
    return errorResponse(err.message || 'ATS analysis failed', 'SERVER_ERROR', 500);
  }
}
