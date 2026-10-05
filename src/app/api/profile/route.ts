import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';
import { z } from 'zod';

const ProfileSchema = z.object({
  fullName: z.string().optional(),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
  degree: z.string().optional().nullable(),
  institution: z.string().optional().nullable(),
  graduationYear: z.number().optional().nullable(),
  cgpa: z.number().optional().nullable(),
  bio: z.string().optional().nullable(),
  linkedIn: z.string().optional().nullable(),
  github: z.string().optional().nullable(),
  portfolio: z.string().optional().nullable(),
  targetCompanyId: z.string().optional().nullable(),
  targetRoleId: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  const profile = await prisma.profile.findUnique({
    where: { userId: auth.user.userId }
  });

  return jsonResponse({ profile });
}

export async function PUT(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const parsed = ProfileSchema.parse(body);

    const profile = await prisma.profile.upsert({
      where: { userId: auth.user.userId },
      create: {
        userId: auth.user.userId,
        fullName: parsed.fullName || 'User',
        ...parsed,
      },
      update: parsed,
    });

    return jsonResponse({ profile });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return errorResponse(err.errors[0].message, 'VALIDATION_ERROR', 400);
    }
    return errorResponse(err.message || 'Failed to update profile', 'SERVER_ERROR', 500);
  }
}
