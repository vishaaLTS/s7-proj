import { prisma } from '@/lib/db';

export class NotificationService {
  public static async createNotification(userId: string, title: string, message: string, type = 'INFO') {
    return prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      }
    });
  }

  public static async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  public static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }
}

export class AuditLogService {
  public static async logAction(
    userId: string | null,
    action: string,
    entityType: string,
    entityId?: string,
    metadata?: any,
    ipAddress?: string
  ) {
    return prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId: entityId || null,
        metadataJson: metadata ? JSON.stringify(metadata) : null,
        ipAddress: ipAddress || null,
      }
    });
  }
}
