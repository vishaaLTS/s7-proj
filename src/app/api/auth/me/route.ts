import { NextRequest } from 'next/server';
import { clearAuthCookie, getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { jsonResponse, errorResponse } from '@/lib/rbac';

export async function POST() {
  clearAuthCookie();
  return jsonResponse({ message: 'Logged out successfully' });
}

export async function GET() {
  const tokenPayload = await getAuthUser();
  if (!tokenPayload) {
    return errorResponse('Not authenticated', 'UNAUTHORIZED', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: tokenPayload.userId },
    include: {
      profile: true,
      userSkills: {
        include: { skill: true }
      }
    }
  });

  if (!user) {
    return errorResponse('User not found', 'NOT_FOUND', 404);
  }

  return jsonResponse({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      userSkills: user.userSkills,
    }
  });
}
