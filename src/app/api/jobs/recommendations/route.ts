import { NextRequest } from 'next/server';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';
import { JobMatchingService } from '@/services/job-matching';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    const recommendations = await JobMatchingService.getRecommendationsForUser(auth.user.userId);
    return jsonResponse({ recommendations });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to compute job recommendations', 'SERVER_ERROR', 500);
  }
}
