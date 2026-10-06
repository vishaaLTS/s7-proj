import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['STUDENT', 'JOB_SEEKER', 'COUNSELOR', 'EMPLOYER', 'ADMIN']).default('STUDENT'),
  fullName: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const auth = await authorizeUser(['ADMIN']);
  if ('error' in auth) return auth.error;

  try {
    const users = await prisma.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return jsonResponse({ users });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to fetch users', 'SERVER_ERROR', 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await authorizeUser(['ADMIN']);
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const parsed = CreateUserSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (existing) return errorResponse('User with this email already exists', 'ALREADY_EXISTS', 400);

    const passwordHash = await hashPassword(parsed.password);

    const newUser = await prisma.user.create({
      data: {
        email: parsed.email,
        passwordHash,
        role: parsed.role,
        profile: {
          create: {
            fullName: parsed.fullName,
          }
        }
      },
      include: { profile: true }
    });

    return jsonResponse({ user: newUser }, 201);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return errorResponse(err.errors[0].message, 'VALIDATION_ERROR', 400);
    }
    return errorResponse(err.message || 'Failed to create user', 'SERVER_ERROR', 500);
  }
}
