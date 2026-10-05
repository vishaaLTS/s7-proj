import { prisma } from '@/lib/db';

export class AuditLogger {
  public static async logAction(
    userId: string | null,
    action: string,
    entityType: string,
    entityId?: string,
    metadata?: Record<string, any>,
    ipAddress?: string
  ) {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          entityType,
          entityId: entityId || null,
          metadataJson: metadata ? JSON.stringify(metadata) : null,
          ipAddress: ipAddress || null,
        }
      });
    } catch (err) {
      console.error('Failed to create audit log entry:', err);
    }
  }
}
