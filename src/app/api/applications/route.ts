import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';
import { z } from 'zod';

const CreateApplicationSchema = z.object({
  jobId: z.string().min(1),
  status: z.enum(['SAVED', 'APPLIED', 'ASSESSMENT', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN']).default('APPLIED'),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    const applications = await prisma.jobApplication.findMany({
      where: { userId: auth.user.userId },
      include: {
        job: {
          include: { company: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return jsonResponse({ applications });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to fetch job applications', 'SERVER_ERROR', 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const parsed = CreateApplicationSchema.parse(body);

    const job = await prisma.job.findUnique({ where: { id: parsed.jobId } });
    if (!job) return errorResponse('Job not found', 'NOT_FOUND', 404);

    const application = await prisma.jobApplication.upsert({
      where: {
        userId_jobId: {
          userId: auth.user.userId,
          jobId: parsed.jobId,
        }
      },
      create: {
        userId: auth.user.userId,
        jobId: parsed.jobId,
        status: parsed.status,
        notes: parsed.notes || null,
        appliedAt: parsed.status === 'APPLIED' ? new Date() : new Date(),
      },
      update: {
        status: parsed.status,
        notes: parsed.notes !== undefined ? parsed.notes : undefined,
      },
      include: { job: { include: { company: true } } }
    });

    return jsonResponse({ application });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return errorResponse(err.errors[0].message, 'VALIDATION_ERROR', 400);
    }
    return errorResponse(err.message || 'Failed to save job application', 'SERVER_ERROR', 500);
  }
}
