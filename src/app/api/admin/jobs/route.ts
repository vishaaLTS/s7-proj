import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';
import { z } from 'zod';

const CreateJobSchema = z.object({
  companyId: z.string().min(1),
  title: z.string().min(1),
  location: z.string().min(1),
  jobType: z.string().default('FULL_TIME'),
  description: z.string().min(1),
  requirements: z.array(z.string()).min(1),
  salaryRange: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await authorizeUser(['ADMIN']);
  if ('error' in auth) return auth.error;

  try {
    const jobs = await prisma.job.findMany({
      include: { company: true },
      orderBy: { createdAt: 'desc' }
    });

    return jsonResponse({ jobs });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to fetch jobs', 'SERVER_ERROR', 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await authorizeUser(['ADMIN']);
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const parsed = CreateJobSchema.parse(body);

    const job = await prisma.job.create({
      data: {
        companyId: parsed.companyId,
        title: parsed.title,
        location: parsed.location,
        jobType: parsed.jobType,
        description: parsed.description,
        requirementsJson: JSON.stringify(parsed.requirements),
        salaryRange: parsed.salaryRange || null,
        source: 'ADMIN_CREATED',
      },
      include: { company: true }
    });

    return jsonResponse({ job }, 201);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return errorResponse(err.errors[0].message, 'VALIDATION_ERROR', 400);
    }
    return errorResponse(err.message || 'Failed to create job', 'SERVER_ERROR', 500);
  }
}
