import { NextRequest } from 'next/server';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';
import { NotificationService } from '@/services/notification-service';

export async function GET(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    const notifications = await NotificationService.getUserNotifications(auth.user.userId);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return jsonResponse({ notifications, unreadCount });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to fetch notifications', 'SERVER_ERROR', 500);
  }
}
