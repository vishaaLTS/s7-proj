import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { comparePassword, signToken, setAuthCookie, Role } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/rbac';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: parsed.email.toLowerCase() },
      include: { profile: true }
    });

    if (!user) {
      return errorResponse('Invalid email or password', 'INVALID_CREDENTIALS', 401);
    }

    const isMatch = await comparePassword(parsed.password, user.passwordHash);
    if (!isMatch) {
      return errorResponse('Invalid email or password', 'INVALID_CREDENTIALS', 401);
    }

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
        targetCompanyId: user.profile?.targetCompanyId,
        targetRoleId: user.profile?.targetRoleId,
      }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return errorResponse('Invalid input credentials format', 'VALIDATION_ERROR', 400);
    }
    return errorResponse(err.message || 'Login failed', 'SERVER_ERROR', 500);
  }
}
