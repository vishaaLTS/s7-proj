import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';
import { z } from 'zod';
import { NotificationService } from '@/services/notification-service';

export const dynamic = 'force-dynamic';

const CompleteSchema = z.object({
  repoUrl: z.string().url().optional().or(z.literal('')),
  liveUrl: z.string().url().optional().or(z.literal('')),
  progressNotes: z.string().optional(),
  uploadedFilesJson: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    const projectId = params.id;
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return errorResponse('Project not found', 'NOT_FOUND', 404);

    let body = {};
    try {
      body = await req.json();
    } catch {}

    const parsed = CompleteSchema.parse(body);

    const userProject = await prisma.userProject.upsert({
      where: {
        userId_projectId: {
          userId: auth.user.userId,
          projectId,
        }
      },
      create: {
        userId: auth.user.userId,
        projectId,
        status: 'COMPLETED',
        progressNotes: parsed.progressNotes || null,
        uploadedFilesJson: parsed.uploadedFilesJson || null,
        repoUrl: parsed.repoUrl || null,
        liveUrl: parsed.liveUrl || null,
        submittedAt: new Date(),
      },
      update: {
        status: 'COMPLETED',
        progressNotes: parsed.progressNotes || null,
        uploadedFilesJson: parsed.uploadedFilesJson || null,
        repoUrl: parsed.repoUrl || null,
        liveUrl: parsed.liveUrl || null,
        submittedAt: new Date(),
      }
    });

    await NotificationService.createNotification(
      auth.user.userId,
      'Project Completed ✓',
      `You completed the practical portfolio project "${project.title}". Readiness score updated!`,
      'SUCCESS'
    );

    return jsonResponse({ userProject });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return errorResponse(err.errors[0].message, 'VALIDATION_ERROR', 400);
    }
    return errorResponse(err.message || 'Failed to complete project', 'SERVER_ERROR', 500);
  }
}
