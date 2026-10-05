import { NextRequest } from 'next/server';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';
import { NotificationService } from '@/services/notification-service';

export async function POST(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    await NotificationService.markAllAsRead(auth.user.userId);
    return jsonResponse({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to update notifications', 'SERVER_ERROR', 500);
  }
}
