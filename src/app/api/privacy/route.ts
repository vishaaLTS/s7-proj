import { NextRequest } from 'next/server';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';
import { PrivacyService } from '@/services/privacy-service';

export async function GET(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    const data = await PrivacyService.exportUserData(auth.user.userId);
    return jsonResponse(data);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to export user data', 'SERVER_ERROR', 500);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    const url = new URL(req.url);
    const resumeId = url.searchParams.get('resumeId');

    if (resumeId) {
      await PrivacyService.deleteResume(auth.user.userId, resumeId);
      return jsonResponse({ message: 'Resume deleted successfully' });
    }

    const deleteAccount = url.searchParams.get('deleteAccount');
    if (deleteAccount === 'true') {
      await PrivacyService.deleteAccount(auth.user.userId);
      return jsonResponse({ message: 'Account deleted successfully' });
    }

    return errorResponse('Missing parameter resumeId or deleteAccount=true', 'BAD_REQUEST', 400);
  } catch (err: any) {
    return errorResponse(err.message || 'Privacy action failed', 'SERVER_ERROR', 500);
  }
}
