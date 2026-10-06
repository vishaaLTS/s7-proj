import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    const projectId = params.id;
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return errorResponse('Project not found', 'NOT_FOUND', 404);

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
        status: 'IN_PROGRESS',
      },
      update: {
        status: 'IN_PROGRESS',
      }
    });

    return jsonResponse({ userProject });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to start project', 'SERVER_ERROR', 500);
  }
}
