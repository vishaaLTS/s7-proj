import { NextRequest } from 'next/server';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';
import { FileStorageService } from '@/services/file-storage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return errorResponse('No file provided', 'BAD_REQUEST', 400);
    }

    if (file.size > 25 * 1024 * 1024) {
      return errorResponse('Project file exceeds 25MB limit', 'PAYLOAD_TOO_LARGE', 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const asset = await FileStorageService.saveFile(
      auth.user.userId,
      buffer,
      file.name,
      file.type || 'application/octet-stream'
    );

    return jsonResponse({
      file: {
        id: asset.id,
        name: file.name,
        size: file.size,
        mimeType: file.type,
        key: asset.storageKey,
      }
    });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to upload project file', 'SERVER_ERROR', 500);
  }
}
