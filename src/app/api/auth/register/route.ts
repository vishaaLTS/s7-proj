import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, signToken, setAuthCookie, Role } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/rbac';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const RegisterSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.email.toLowerCase() }
    });

    if (existingUser) {
      return errorResponse('An account with this email already exists', 'ALREADY_EXISTS', 400);
    }

    const passwordHash = await hashPassword(parsed.password);

    const user = await prisma.user.create({
      data: {
        email: parsed.email.toLowerCase(),
        passwordHash,
        role: 'STUDENT',
        profile: {
          create: {
            fullName: parsed.fullName,
          }
        }
      },
      include: { profile: true }
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: (user.role as Role) || 'STUDENT',
    });

    setAuthCookie(token);

    return jsonResponse({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.profile?.fullName,
      }
    }, 201);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return errorResponse(err.errors[0].message, 'VALIDATION_ERROR', 400);
    }
    return errorResponse(err.message || 'Registration failed', 'SERVER_ERROR', 500);
  }
}
