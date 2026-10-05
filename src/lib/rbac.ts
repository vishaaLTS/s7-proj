import { NextResponse } from 'next/server';
import { getAuthUser, TokenPayload, Role } from './auth';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  requestId?: string;
}

export function jsonResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, code = 'BAD_REQUEST', status = 400, details?: any): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
      requestId: Math.random().toString(36).substring(7),
    },
    { status }
  );
}

export async function authorizeUser(allowedRoles?: Role[]): Promise<{ user: TokenPayload } | { error: NextResponse }> {
  const user = await getAuthUser();
  if (!user) {
    return { error: errorResponse('Authentication required', 'UNAUTHORIZED', 401) };
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return { error: errorResponse('Forbidden: Insufficient permissions', 'FORBIDDEN', 403) };
  }

  return { user };
}

export async function requireAuth(): Promise<TokenPayload> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

export async function requireRole(allowedRoles: Role[]): Promise<TokenPayload> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error('FORBIDDEN');
  }
  return user;
}

export function requireOwnership(resourceUserId: string, authUserId: string, isUserAdmin = false) {
  if (resourceUserId !== authUserId && !isUserAdmin) {
    throw new Error('FORBIDDEN_OWNERSHIP');
  }
}

export async function requirePermission(resourceUserId: string, allowedRoles?: Role[]): Promise<TokenPayload> {
  const user = await requireAuth();
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error('FORBIDDEN');
  }
  requireOwnership(resourceUserId, user.userId, user.role === 'ADMIN');
  return user;
}
