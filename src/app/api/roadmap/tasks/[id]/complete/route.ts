import { NextRequest } from 'next/server';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';
import { RoadmapService } from '@/services/training-roadmap';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    const result = await RoadmapService.toggleTaskCompletion(params.id, auth.user.userId);
    return jsonResponse(result);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to toggle task status', 'SERVER_ERROR', 500);
  }
}
