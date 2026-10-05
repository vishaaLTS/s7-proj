import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { prisma } from '@/lib/db';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export class FileStorageService {
  private static async ensureUploadDir() {
    try {
      await fs.access(UPLOAD_DIR);
    } catch {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }
  }

  public static async saveFile(
    ownerId: string,
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType: string
  ) {
    await this.ensureUploadDir();

    const fileExt = path.extname(originalFilename) || '.pdf';
    const storageKey = `${ownerId}_${Date.now()}_${crypto.randomBytes(8).toString('hex')}${fileExt}`;
    const filePath = path.join(UPLOAD_DIR, storageKey);

    // Calculate checksum
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Save to disk
    await fs.writeFile(filePath, fileBuffer);

    // Persist FileAsset metadata
    const fileAsset = await prisma.fileAsset.create({
      data: {
        ownerId,
        storageKey,
        originalFilename,
        mimeType,
        size: fileBuffer.length,
        checksum,
      },
    });

    return fileAsset;
  }

  public static async getFilePath(storageKey: string, ownerId: string): Promise<string | null> {
    const asset = await prisma.fileAsset.findFirst({
      where: { storageKey, ownerId },
    });
    if (!asset) return null;

    const filePath = path.join(UPLOAD_DIR, storageKey);
    try {
      await fs.access(filePath);
      return filePath;
    } catch {
      return null;
    }
  }

  public static async deleteFile(storageKey: string, ownerId: string): Promise<boolean> {
    const asset = await prisma.fileAsset.findFirst({
      where: { storageKey, ownerId },
    });
    if (!asset) return false;

    const filePath = path.join(UPLOAD_DIR, storageKey);
    try {
      await fs.unlink(filePath);
    } catch {}

    await prisma.fileAsset.delete({ where: { id: asset.id } });
    return true;
  }
}
