import { NextRequest } from 'next/server';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';
import { CareerIntelligenceService } from '@/services/career-intelligence';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    const data = await CareerIntelligenceService.getCareerIntelligencePipeline(auth.user.userId);
    return jsonResponse(data);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to fetch career intelligence pipeline', 'SERVER_ERROR', 500);
  }
}
